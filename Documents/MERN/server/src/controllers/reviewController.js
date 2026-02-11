const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { NotFoundError, BadRequestError } = require('../utils/errors');

/**
 * Get product reviews
 * @route GET /api/reviews/products/:productId
 */
exports.getProductReviews = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const skip = (page - 1) * limit;

    const query = {
      productId: req.params.productId,
      isApproved: true,
    };

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('userId', 'firstName lastName avatar')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      Review.countDocuments(query),
    ]);

    const pagination = {
      currentPage: page,
      itemsPerPage: limit,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    };

    res.json({
      success: true,
      data: { reviews, pagination },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create review
 * @route POST /api/reviews/products/:productId
 */
exports.createReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { rating, title, comment, images } = req.body;

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Check if user has purchased this product
    const order = await Order.findOne({
      userId: req.user.id,
      'items.productId': productId,
      status: 'delivered',
    });

    const isVerifiedPurchase = !!order;

    // Create review
    const review = await Review.create({
      userId: req.user.id,
      productId,
      orderId: order?._id,
      rating,
      title,
      comment,
      images: images || [],
      isVerifiedPurchase,
      isApproved: !isVerifiedPurchase, // Auto-approve if not verified purchase
    });

    // Update product rating
    await updateProductRating(productId);

    const populatedReview = await Review.findById(review._id).populate(
      'userId',
      'firstName lastName avatar'
    );

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: { review: populatedReview },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update review
 * @route PUT /api/reviews/:id
 */
exports.updateReview = async (req, res, next) => {
  try {
    const { rating, title, comment, images } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      throw new NotFoundError('Review not found');
    }

    // Check ownership
    if (review.userId.toString() !== req.user.id) {
      throw new BadRequestError('You can only update your own reviews');
    }

    // Update review
    review.rating = rating || review.rating;
    review.title = title || review.title;
    review.comment = comment || review.comment;
    review.images = images || review.images;
    await review.save();

    // Update product rating
    await updateProductRating(review.productId);

    const populatedReview = await Review.findById(review._id).populate(
      'userId',
      'firstName lastName avatar'
    );

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: { review: populatedReview },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete review
 * @route DELETE /api/reviews/:id
 */
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      throw new NotFoundError('Review not found');
    }

    // Check ownership or admin
    if (
      review.userId.toString() !== req.user.id &&
      req.user.role !== 'admin' &&
      req.user.role !== 'super_admin'
    ) {
      throw new BadRequestError('You can only delete your own reviews');
    }

    const productId = review.productId;
    await Review.findByIdAndDelete(req.params.id);

    // Update product rating
    await updateProductRating(productId);

    res.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark review as helpful
 * @route POST /api/reviews/:id/helpful
 */
exports.markHelpful = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      throw new NotFoundError('Review not found');
    }

    review.helpfulCount += 1;
    await review.save();

    res.json({
      success: true,
      message: 'Review marked as helpful',
      data: { helpfulCount: review.helpfulCount },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all reviews (admin only)
 * @route GET /api/reviews/admin/all
 */
exports.getAllReviews = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const skip = (page - 1) * limit;

    const query = {};

    if (req.query.isApproved !== undefined) {
      query.isApproved = req.query.isApproved === 'true';
    }

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('userId', 'firstName lastName email')
        .populate('productId', 'name')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      Review.countDocuments(query),
    ]);

    const pagination = {
      currentPage: page,
      itemsPerPage: limit,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    };

    res.json({
      success: true,
      data: { reviews, pagination },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve review (admin only)
 * @route PUT /api/reviews/admin/:id/approve
 */
exports.approveReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      throw new NotFoundError('Review not found');
    }

    review.isApproved = true;
    await review.save();

    // Update product rating
    await updateProductRating(review.productId);

    const populatedReview = await Review.findById(review._id).populate(
      'userId',
      'firstName lastName avatar'
    );

    res.json({
      success: true,
      message: 'Review approved successfully',
      data: { review: populatedReview },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update product rating after review changes
 */
async function updateProductRating(productId) {
  try {
    const reviews = await Review.find({ productId, isApproved: true });
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    await Product.findByIdAndUpdate(productId, {
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount: reviews.length,
    });
  } catch (error) {
    console.error('Error updating product rating:', error);
  }
}
