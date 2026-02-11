const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5'],
    },
    title: {
      type: String,
      required: [true, 'Review title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    images: [
      {
        type: String,
      },
    ],
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    helpfulCount: {
      type: Number,
      default: 0,
      min: [0, 'Helpful count cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
reviewSchema.index({ productId: 1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ orderId: 1 });
reviewSchema.index({ isApproved: 1 });
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true }); // One review per product per user

// Ensure only one review per product per user
reviewSchema.pre('save', async function (next) {
  if (this.isNew) {
    const existingReview = await this.constructor.findOne({
      productId: this.productId,
      userId: this.userId,
    });

    if (existingReview) {
      const error = new Error('You have already reviewed this product');
      error.name = 'ValidationError';
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('Review', reviewSchema);
