const express = require('express');
const { body, param } = require('express-validator');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validation');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

// Create payment intent
router.post(
  '/create-intent',
  protect,
  [
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Invalid currency code'),
  ],
  validate,
  paymentController.createPaymentIntent
);

// Confirm payment
router.post(
  '/confirm',
  protect,
  [
    body('paymentIntentId').notEmpty().withMessage('Payment intent ID is required'),
    body('paymentMethodId').notEmpty().withMessage('Payment method ID is required'),
  ],
  validate,
  paymentController.confirmPayment
);

// Webhook handler (no auth required)
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.webhook);

// Get payment status
router.get(
  '/:orderId',
  protect,
  [param('orderId').isMongoId().withMessage('Invalid order ID')],
  validate,
  paymentController.getPaymentStatus
);

module.exports = router;
