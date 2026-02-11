const express = require('express');
const { body, param, query } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validation');
const inventoryController = require('../controllers/inventoryController');

const router = express.Router();

// Get inventory overview (admin only)
router.get(
  '/',
  protect,
  authorize('admin', 'super_admin'),
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('lowStock').optional().isBoolean(),
  ],
  validate,
  inventoryController.getInventoryOverview
);

// Get inventory logs (admin only)
router.get(
  '/logs',
  protect,
  authorize('admin', 'super_admin'),
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('productId').optional().isMongoId(),
    query('type').optional().isIn(['in', 'out', 'adjustment']),
  ],
  validate,
  inventoryController.getInventoryLogs
);

// Adjust inventory (admin only)
router.post(
  '/adjust',
  protect,
  authorize('admin', 'super_admin'),
  [
    body('productId').isMongoId().withMessage('Invalid product ID'),
    body('quantity').isInt().withMessage('Quantity must be an integer'),
    body('type').isIn(['in', 'out', 'adjustment']).withMessage('Invalid inventory type'),
    body('reason').notEmpty().withMessage('Reason is required'),
  ],
  validate,
  inventoryController.adjustInventory
);

// Bulk update inventory (admin only)
router.post(
  '/bulk-update',
  protect,
  authorize('admin', 'super_admin'),
  [
    body('updates').isArray({ min: 1 }).withMessage('Updates array is required'),
    body('updates.*.productId').isMongoId().withMessage('Invalid product ID'),
    body('updates.*.stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  ],
  validate,
  inventoryController.bulkUpdateInventory
);

module.exports = router;
