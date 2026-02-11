const express = require('express');
const { query } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validation');
const analyticsController = require('../controllers/analyticsController');

const router = express.Router();

// Get dashboard analytics (admin only)
router.get(
  '/dashboard',
  protect,
  authorize('admin', 'super_admin'),
  [
    query('period').optional().isIn(['today', 'week', 'month', 'year', 'all']),
  ],
  validate,
  analyticsController.getDashboardAnalytics
);

// Get sales analytics (admin only)
router.get(
  '/sales',
  protect,
  authorize('admin', 'super_admin'),
  [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('groupBy').optional().isIn(['day', 'week', 'month']),
  ],
  validate,
  analyticsController.getSalesAnalytics
);

// Get product analytics (admin only)
router.get(
  '/products',
  protect,
  authorize('admin', 'super_admin'),
  [
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('sortBy').optional().isIn(['sales', 'revenue', 'rating']),
  ],
  validate,
  analyticsController.getProductAnalytics
);

// Get customer analytics (admin only)
router.get(
  '/customers',
  protect,
  authorize('admin', 'super_admin'),
  [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
  ],
  validate,
  analyticsController.getCustomerAnalytics
);

// Generate reports (admin only)
router.get(
  '/reports',
  protect,
  authorize('admin', 'super_admin'),
  [
    query('type').isIn(['sales', 'products', 'customers', 'inventory']).withMessage('Invalid report type'),
    query('format').optional().isIn(['json', 'csv']),
  ],
  validate,
  analyticsController.generateReport
);

module.exports = router;
