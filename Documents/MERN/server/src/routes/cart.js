const express = require('express');
const { body, param } = require('express-validator');
const { protect, optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validation');
const cartController = require('../controllers/cartController');

const router = express.Router();

// Get user cart
router.get('/', protect, cartController.getCart);

// Add item to cart
router.post(
  '/items',
  protect,
  [
    body('productId').isMongoId().withMessage('Invalid product ID'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  ],
  validate,
  cartController.addItem
);

// Update cart item quantity
router.put(
  '/items/:itemId',
  protect,
  [
    param('itemId').isMongoId().withMessage('Invalid item ID'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  ],
  validate,
  cartController.updateItem
);

// Remove item from cart
router.delete(
  '/items/:itemId',
  protect,
  [param('itemId').isMongoId().withMessage('Invalid item ID')],
  validate,
  cartController.removeItem
);

// Clear cart
router.delete('/', protect, cartController.clearCart);

// Merge guest cart to user cart
router.post('/merge', protect, cartController.mergeCart);

module.exports = router;
