const mongoose = require('mongoose');

const inventoryLogSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    type: {
      type: String,
      enum: ['in', 'out', 'adjustment'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    referenceType: {
      type: String,
      enum: ['order', 'restock', 'return', 'manual', 'system'],
    },
    previousStock: {
      type: Number,
      required: true,
    },
    newStock: {
      type: Number,
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
inventoryLogSchema.index({ productId: 1 });
inventoryLogSchema.index({ type: 1 });
inventoryLogSchema.index({ createdAt: -1 });
inventoryLogSchema.index({ referenceId: 1, referenceType: 1 });

module.exports = mongoose.model('InventoryLog', inventoryLogSchema);
