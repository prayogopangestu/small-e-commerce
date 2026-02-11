const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Analytics = require('../models/Analytics');
const { BadRequestError } = require('../utils/errors');

/**
 * Get dashboard analytics (admin only)
 * @route GET /api/analytics/dashboard
 */
exports.getDashboardAnalytics = async (req, res, next) => {
  try {
    const period = req.query.period || 'today';

    // Calculate date range
    const now = new Date();
    let startDate;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'all':
        startDate = new Date(0);
        break;
      default:
        throw new BadRequestError('Invalid period');
    }

    // Get analytics data
    const [orders, products, users] = await Promise.all([
      Order.find({
        createdAt: { $gte: startDate },
        status: { $ne: 'cancelled' },
      }),
      Product.find({ isActive: true }),
      User.find({ role: 'customer' }),
    ]);

    // Calculate metrics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalCustomers = users.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get top products
    const productSales = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const key = item.productId.toString();
        if (!productSales[key]) {
          productSales[key] = {
            productId: item.productId,
            name: item.name,
            salesCount: 0,
            revenue: 0,
          };
        }
        productSales[key].salesCount += item.quantity;
        productSales[key].revenue += item.totalPrice;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    res.json({
      success: true,
      data: {
        period,
        dateRange: {
          start: startDate,
          end: now,
        },
        metrics: {
          totalOrders,
          totalRevenue,
          totalCustomers,
          averageOrderValue,
          conversionRate: 0, // Would need visit tracking
        },
        topProducts,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get sales analytics (admin only)
 * @route GET /api/analytics/sales
 */
exports.getSalesAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const matchStage = {
      status: { $ne: 'cancelled' },
    };

    if (Object.keys(dateFilter).length > 0) {
      matchStage.createdAt = dateFilter;
    }

    // Group by date
    const groupByDate = {
      day: {
        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
      },
      week: {
        $dateToString: { format: '%Y-%U', date: '$createdAt' },
      },
      month: {
        $dateToString: { format: '%Y-%m', date: '$createdAt' },
      },
    };

    const salesData = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: groupByDate[groupBy],
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          averageOrderValue: { $avg: '$total' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        salesData,
        groupBy,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get product analytics (admin only)
 * @route GET /api/analytics/products
 */
exports.getProductAnalytics = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || 'revenue';

    const orders = await Order.find({ status: { $ne: 'cancelled' } });

    const productStats = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const key = item.productId.toString();
        if (!productStats[key]) {
          productStats[key] = {
            productId: item.productId,
            name: item.name,
            salesCount: 0,
            revenue: 0,
            averageRating: 0,
            reviewCount: 0,
          };
        }
        productStats[key].salesCount += item.quantity;
        productStats[key].revenue += item.totalPrice;
      });
    });

    // Get product ratings
    const products = await Product.find({ _id: { $in: Object.keys(productStats) } });
    products.forEach((product) => {
      const key = product._id.toString();
      if (productStats[key]) {
        productStats[key].averageRating = product.averageRating;
        productStats[key].reviewCount = product.reviewCount;
      }
    });

    // Sort and limit
    const sortedProducts = Object.values(productStats).sort((a, b) => {
      return sortBy === 'sales' ? b.salesCount - a.salesCount : b.revenue - a.revenue;
    }).slice(0, limit);

    res.json({
      success: true,
      data: {
        products: sortedProducts,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get customer analytics (admin only)
 * @route GET /api/analytics/customers
 */
exports.getCustomerAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    // Get new customers
    const customerQuery = { role: 'customer' };
    if (Object.keys(dateFilter).length > 0) {
      customerQuery.createdAt = dateFilter;
    }

    const newCustomers = await User.countDocuments(customerQuery);
    const totalCustomers = await User.countDocuments({ role: 'customer' });

    // Get repeat customers (customers with multiple orders)
    const repeatCustomers = await Order.aggregate([
      {
        $match: {
          status: { $ne: 'cancelled' },
          ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}),
        },
      },
      {
        $group: {
          _id: '$userId',
          orderCount: { $sum: 1 },
        },
      },
      {
        $match: { orderCount: { $gt: 1 } },
      },
      {
        $count: 'count',
      },
    ]);

    // Get customer lifetime value
    const customerLifetimeValue = await Order.aggregate([
      {
        $match: {
          status: { $ne: 'cancelled' },
          ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}),
        },
      },
      {
        $group: {
          _id: '$userId',
          totalSpent: { $sum: '$total' },
        },
      },
      {
        $group: {
          _id: null,
          averageLifetimeValue: { $avg: '$totalSpent' },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        newCustomers,
        totalCustomers,
        repeatCustomers: repeatCustomers[0]?.count || 0,
        averageLifetimeValue: customerLifetimeValue[0]?.averageLifetimeValue || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate reports (admin only)
 * @route GET /api/analytics/reports
 */
exports.generateReport = async (req, res, next) => {
  try {
    const { type, format = 'json' } = req.query;

    let data;

    switch (type) {
      case 'sales':
        data = await generateSalesReport();
        break;
      case 'products':
        data = await generateProductsReport();
        break;
      case 'customers':
        data = await generateCustomersReport();
        break;
      case 'inventory':
        data = await generateInventoryReport();
        break;
      default:
        throw new BadRequestError('Invalid report type');
    }

    if (format === 'csv') {
      // Convert to CSV
      const csv = convertToCSV(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${type}-report.csv`);
      res.send(csv);
    } else {
      res.json({
        success: true,
        data: { report: data },
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Generate sales report
 */
async function generateSalesReport() {
  const orders = await Order.find({ status: { $ne: 'cancelled' } })
    .populate('userId', 'email firstName lastName')
    .sort('-createdAt');

  return orders.map((order) => ({
    orderNumber: order.orderNumber,
    date: order.createdAt,
    customer: `${order.userId.firstName} ${order.userId.lastName}`,
    email: order.userId.email,
    total: order.total,
    status: order.status,
    paymentStatus: order.paymentStatus,
  }));
}

/**
 * Generate products report
 */
async function generateProductsReport() {
  const products = await Product.find({ isActive: true }).populate(
    'category',
    'name'
  );

  return products.map((product) => ({
    name: product.name,
    sku: product.sku,
    category: product.category.name,
    price: product.price,
    stock: product.stock,
    averageRating: product.averageRating,
    reviewCount: product.reviewCount,
  }));
}

/**
 * Generate customers report
 */
async function generateCustomersReport() {
  const users = await User.find({ role: 'customer' }).sort('-createdAt');

  return users.map((user) => ({
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    registeredAt: user.createdAt,
    isEmailVerified: user.isEmailVerified,
  }));
}

/**
 * Generate inventory report
 */
async function generateInventoryReport() {
  const products = await Product.find().populate('category', 'name');

  return products.map((product) => ({
    name: product.name,
    sku: product.sku,
    category: product.category.name,
    stock: product.stock,
    lowStockThreshold: product.lowStockThreshold,
    status: product.stock === 0 ? 'Out of Stock' : product.stock <= product.lowStockThreshold ? 'Low Stock' : 'In Stock',
  }));
}

/**
 * Convert data to CSV
 */
function convertToCSV(data) {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const rows = data.map((obj) =>
    headers.map((header) => JSON.stringify(obj[header] || '')).join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}
