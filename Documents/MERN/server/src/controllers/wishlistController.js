const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const { NotFoundError } = require('../utils/errors');

/**
 * Get user wishlist
 * @route GET /api/wishlist
 */
exports.getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.user.id })
      .populate('items.productId', 'name images price stock averageRating reviewCount');

    if (!wishlist) {
      wishlist = await Wishlist.create({ userId: req.user.id, items: [] });
    }

    res.json({
      success: true,
      data: { wishlist },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add item to wishlist
 * @route POST /api/wishlist/items
 */
exports.addItem = async (req, res, next) => {
  try {
    const { productId } = req.body;

    // Verify product exists and is active
    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    let wishlist = await Wishlist.findOne({ userId: req.user.id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        userId: req.user.id,
        items: [],
      });
    }

    // Check if item already exists in wishlist
    const existingItem = wishlist.items.find(
      (item) => item.productId.toString() === productId
    );

    if (existingItem) {
      return res.json({
        success: true,
        message: 'Item already in wishlist',
        data: { wishlist },
      });
    }

    wishlist.items.push({
      productId,
      addedAt: new Date(),
    });

    await wishlist.save();

    const populatedWishlist = await Wishlist.findById(wishlist._id)
      .populate('items.productId', 'name images price stock averageRating reviewCount');

    res.status(201).json({
      success: true,
      message: 'Item added to wishlist',
      data: { wishlist: populatedWishlist },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove item from wishlist
 * @route DELETE /api/wishlist/items/:productId
 */
exports.removeItem = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user.id });

    if (!wishlist) {
      throw new NotFoundError('Wishlist not found');
    }

    wishlist.items = wishlist.items.filter(
      (item) => item.productId.toString() !== req.params.productId
    );

    await wishlist.save();

    const populatedWishlist = await Wishlist.findById(wishlist._id)
      .populate('items.productId', 'name images price stock averageRating reviewCount');

    res.json({
      success: true,
      message: 'Item removed from wishlist',
      data: { wishlist: populatedWishlist },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Clear wishlist
 * @route DELETE /api/wishlist
 */
exports.clearWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOneAndUpdate(
      { userId: req.user.id },
      { items: [] },
      { new: true }
    ).populate('items.productId', 'name images price stock averageRating reviewCount');

    res.json({
      success: true,
      message: 'Wishlist cleared',
      data: { wishlist },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Move item to cart
 * @route POST /api/wishlist/move-to-cart
 */
exports.moveToCart = async (req, res, next) => {
  try {
    const { productId } = req.body;

    const wishlist = await Wishlist.findOne({ userId: req.user.id });
    if (!wishlist) {
      throw new NotFoundError('Wishlist not found');
    }

    const wishlistItem = wishlist.items.find(
      (item) => item.productId.toString() === productId
    );

    if (!wishlistItem) {
      throw new NotFoundError('Item not found in wishlist');
    }

    // Verify product exists and is active
    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Add to cart
    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      cart = await Cart.create({
        userId: req.user.id,
        items: [],
      });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += 1;
    } else {
      cart.items.push({
        productId,
        quantity: 1,
        price: product.price,
      });
    }

    await cart.save();

    // Remove from wishlist
    wishlist.items = wishlist.items.filter(
      (item) => item.productId.toString() !== productId
    );
    await wishlist.save();

    const populatedWishlist = await Wishlist.findById(wishlist._id)
      .populate('items.productId', 'name images price stock averageRating reviewCount');

    res.json({
      success: true,
      message: 'Item moved to cart',
      data: { wishlist: populatedWishlist },
    });
  } catch (error) {
    next(error);
  }
};
