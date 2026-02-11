const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
wishlistSchema.index({ userId: 1 });
wishlistSchema.index({ 'items.productId': 1 });

// Ensure only unique products in wishlist
wishlistSchema.pre('save', function (next) {
  const uniqueItems = [];
  const productIds = new Set();

  this.items.forEach((item) => {
    const productId = item.productId.toString();
    if (!productIds.has(productId)) {
      productIds.add(productId);
      uniqueItems.push(item);
    }
  });

  this.items = uniqueItems;
  next();
});

module.exports = mongoose.model('Wishlist', wishlistSchema);
