const express = require('express');
const { body, param, query } = require('express-validator');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/upload');
const validate = require('../middleware/validation');
const productController = require('../controllers/productController');

const router = express.Router();

// Get all products (public)
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('category').optional().isMongoId(),
    query('minPrice').optional().isFloat({ min: 0 }),
    query('maxPrice').optional().isFloat({ min: 0 }),
    query('sort').optional(),
  ],
  validate,
  productController.getProducts
);

// Get featured products (public)
router.get('/featured', productController.getFeaturedProducts);

// Search products (public)
router.get(
  '/search',
  [
    query('q').notEmpty().withMessage('Search query is required'),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  productController.searchProducts
);

// Get product by ID (public)
router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid product ID')],
  validate,
  productController.getProductById
);

// Get product by slug (public)
router.get(
  '/slug/:slug',
  [param('slug').notEmpty().withMessage('Slug is required')],
  validate,
  productController.getProductBySlug
);

// Create product (admin only)
router.post(
  '/',
  protect,
  authorize('admin', 'super_admin'),
  uploadMultiple,
  [
    body('name').notEmpty().withMessage('Product name is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category').isMongoId().withMessage('Invalid category ID'),
  ],
  validate,
  productController.createProduct
);

// Update product (admin only)
router.put(
  '/:id',
  protect,
  authorize('admin', 'super_admin'),
  uploadMultiple,
  [param('id').isMongoId().withMessage('Invalid product ID')],
  validate,
  productController.updateProduct
);

// Delete product (admin only)
router.delete(
  '/:id',
  protect,
  authorize('admin', 'super_admin'),
  [param('id').isMongoId().withMessage('Invalid product ID')],
  validate,
  productController.deleteProduct
);

// Update product stock (admin only)
router.patch(
  '/:id/stock',
  protect,
  authorize('admin', 'super_admin'),
  [
    param('id').isMongoId().withMessage('Invalid product ID'),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  ],
  validate,
  productController.updateStock
);

module.exports = router;
