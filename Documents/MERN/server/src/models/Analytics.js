const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      unique: true,
    },
    metrics: {
      totalOrders: {
        type: Number,
        default: 0,
        min: [0, 'Total orders cannot be negative'],
      },
      totalRevenue: {
        type: Number,
        default: 0,
        min: [0, 'Total revenue cannot be negative'],
      },
      totalCustomers: {
        type: Number,
        default: 0,
        min: [0, 'Total customers cannot be negative'],
      },
      averageOrderValue: {
        type: Number,
        default: 0,
        min: [0, 'Average order value cannot be negative'],
      },
      conversionRate: {
        type: Number,
        default: 0,
        min: [0, 'Conversion rate cannot be negative'],
        max: [100, 'Conversion rate cannot exceed 100'],
      },
      totalVisits: {
        type: Number,
        default: 0,
        min: [0, 'Total visits cannot be negative'],
      },
      topProducts: [
        {
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
          },
          name: String,
          salesCount: {
            type: Number,
            min: [0, 'Sales count cannot be negative'],
          },
          revenue: {
            type: Number,
            min: [0, 'Revenue cannot be negative'],
          },
        },
      ],
      topCategories: [
        {
          categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
          },
          name: String,
          salesCount: {
            type: Number,
            min: [0, 'Sales count cannot be negative'],
          },
          revenue: {
            type: Number,
            min: [0, 'Revenue cannot be negative'],
          },
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
analyticsSchema.index({ date: 1 });
analyticsSchema.index({ date: -1 });

// Static method to get or create analytics for a date
analyticsSchema.statics.getOrCreateForDate = async function (date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  let analytics = await this.findOne({
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  });

  if (!analytics) {
    analytics = await this.create({
      date: startOfDay,
    });
  }

  return analytics;
};

module.exports = mongoose.model('Analytics', analyticsSchema);
