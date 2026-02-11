const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      unique: true,
      sparse: true, // Allows null values for guest carts
    },
    sessionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        variantId: {
          type: mongoose.Schema.Types.ObjectId,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'Quantity must be at least 1'],
          default: 1,
        },
        price: {
          type: Number,
          required: true,
          min: [0, 'Price cannot be negative'],
        },
      },
    ],
    couponCode: {
      type: String,
    },
    couponDiscount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
cartSchema.index({ userId: 1 });
cartSchema.index({ sessionId: 1 });

// Virtual for total items count
cartSchema.virtual('totalItems').get(function () {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for subtotal
cartSchema.virtual('subtotal').get(function () {
  return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
});

// Ensure virtual fields are included in JSON
cartSchema.set('toJSON', { virtuals: true });
cartSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Cart', cartSchema);
