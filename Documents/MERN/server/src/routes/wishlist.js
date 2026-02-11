const express = require('express');
const { body, param } = require('express-validator');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validation');
const wishlistController = require('../controllers/wishlistController');

const router = express.Router();

// Get user wishlist
router.get('/', protect, wishlistController.getWishlist);

// Add item to wishlist
router.post(
  '/items',
  protect,
  [body('productId').isMongoId().withMessage('Invalid product ID')],
  validate,
  wishlistController.addItem
);

// Remove item from wishlist
router.delete(
  '/items/:productId',
  protect,
  [param('productId').isMongoId().withMessage('Invalid product ID')],
  validate,
  wishlistController.removeItem
);

// Clear wishlist
router.delete('/', protect, wishlistController.clearWishlist);

// Move item to cart
router.post(
  '/move-to-cart',
  protect,
  [body('productId').isMongoId().withMessage('Invalid product ID')],
  validate,
  wishlistController.moveToCart
);

module.exports = router;
