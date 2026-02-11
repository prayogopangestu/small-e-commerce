const express = require('express');
const { body, param, query } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { reviewLimiter } = require('../middleware/rateLimiter');
const validate = require('../middleware/validation');
const reviewController = require('../controllers/reviewController');

const router = express.Router();

// Get product reviews (public)
router.get(
  '/products/:productId',
  [
    param('productId').isMongoId().withMessage('Invalid product ID'),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  reviewController.getProductReviews
);

// Create review
router.post(
  '/products/:productId',
  protect,
  reviewLimiter,
  [
    param('productId').isMongoId().withMessage('Invalid product ID'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('title').notEmpty().withMessage('Review title is required'),
    body('comment').notEmpty().withMessage('Review comment is required'),
  ],
  validate,
  reviewController.createReview
);

// Update review
router.put(
  '/:id',
  protect,
  [
    param('id').isMongoId().withMessage('Invalid review ID'),
    body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('title').optional().notEmpty(),
    body('comment').optional().notEmpty(),
  ],
  validate,
  reviewController.updateReview
);

// Delete review
router.delete(
  '/:id',
  protect,
  [param('id').isMongoId().withMessage('Invalid review ID')],
  validate,
  reviewController.deleteReview
);

// Mark review as helpful
router.post(
  '/:id/helpful',
  protect,
  [param('id').isMongoId().withMessage('Invalid review ID')],
  validate,
  reviewController.markHelpful
);

// Admin: Get all reviews
router.get(
  '/admin/all',
  protect,
  authorize('admin', 'super_admin'),
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('isApproved').optional().isBoolean(),
  ],
  validate,
  reviewController.getAllReviews
);

// Admin: Approve review
router.put(
  '/admin/:id/approve',
  protect,
  authorize('admin', 'super_admin'),
  [param('id').isMongoId().withMessage('Invalid review ID')],
  validate,
  reviewController.approveReview
);

module.exports = router;
