const express = require('express');
const { body, param, query } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { orderLimiter } = require('../middleware/rateLimiter');
const validate = require('../middleware/validation');
const orderController = require('../controllers/orderController');

const router = express.Router();

// Get user orders
router.get(
  '/',
  protect,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional(),
  ],
  validate,
  orderController.getUserOrders
);

// Get order by ID
router.get(
  '/:id',
  protect,
  [param('id').isMongoId().withMessage('Invalid order ID')],
  validate,
  orderController.getOrderById
);

// Create order
router.post(
  '/',
  protect,
  orderLimiter,
  [
    body('items').isArray({ min: 1 }).withMessage('Items array is required'),
    body('shippingAddress').notEmpty().withMessage('Shipping address is required'),
  ],
  validate,
  orderController.createOrder
);

// Cancel order
router.post(
  '/:id/cancel',
  protect,
  [param('id').isMongoId().withMessage('Invalid order ID')],
  validate,
  orderController.cancelOrder
);

// Track order
router.get(
  '/:id/track',
  protect,
  [param('id').isMongoId().withMessage('Invalid order ID')],
  validate,
  orderController.trackOrder
);

// Admin: Get all orders
router.get(
  '/admin/all',
  protect,
  authorize('admin', 'super_admin'),
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional(),
  ],
  validate,
  orderController.getAllOrders
);

// Admin: Update order status
router.put(
  '/admin/:id/status',
  protect,
  authorize('admin', 'super_admin'),
  [
    param('id').isMongoId().withMessage('Invalid order ID'),
    body('status')
      .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'])
      .withMessage('Invalid status'),
  ],
  validate,
  orderController.updateOrderStatus
);

// Admin: Add tracking info
router.put(
  '/admin/:id/tracking',
  protect,
  authorize('admin', 'super_admin'),
  [
    param('id').isMongoId().withMessage('Invalid order ID'),
    body('trackingNumber').notEmpty().withMessage('Tracking number is required'),
  ],
  validate,
  orderController.addTrackingInfo
);

module.exports = router;
