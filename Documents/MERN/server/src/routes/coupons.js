const express = require('express');
const { body, param } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validation');
const couponController = require('../controllers/couponController');

const router = express.Router();

// Validate coupon code
router.post(
  '/validate',
  protect,
  [body('code').notEmpty().withMessage('Coupon code is required')],
  validate,
  couponController.validateCoupon
);

// Admin: Get all coupons
router.get(
  '/admin/all',
  protect,
  authorize('admin', 'super_admin'),
  couponController.getAllCoupons
);

// Admin: Get coupon by ID
router.get(
  '/admin/:id',
  protect,
  authorize('admin', 'super_admin'),
  [param('id').isMongoId().withMessage('Invalid coupon ID')],
  validate,
  couponController.getCouponById
);

// Admin: Create coupon
router.post(
  '/admin',
  protect,
  authorize('admin', 'super_admin'),
  [
    body('code').notEmpty().withMessage('Coupon code is required'),
    body('type').isIn(['percentage', 'fixed']).withMessage('Invalid coupon type'),
    body('value').isFloat({ min: 0 }).withMessage('Value must be a positive number'),
    body('validFrom').isISO8601().withMessage('Invalid valid from date'),
    body('validUntil').isISO8601().withMessage('Invalid valid until date'),
  ],
  validate,
  couponController.createCoupon
);

// Admin: Update coupon
router.put(
  '/admin/:id',
  protect,
  authorize('admin', 'super_admin'),
  [
    param('id').isMongoId().withMessage('Invalid coupon ID'),
    body('type').optional().isIn(['percentage', 'fixed']).withMessage('Invalid coupon type'),
    body('value').optional().isFloat({ min: 0 }).withMessage('Value must be a positive number'),
  ],
  validate,
  couponController.updateCoupon
);

// Admin: Delete coupon
router.delete(
  '/admin/:id',
  protect,
  authorize('admin', 'super_admin'),
  [param('id').isMongoId().withMessage('Invalid coupon ID')],
  validate,
  couponController.deleteCoupon
);

module.exports = router;
