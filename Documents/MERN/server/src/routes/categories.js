const express = require('express');
const { body, param } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');
const validate = require('../middleware/validation');
const categoryController = require('../controllers/categoryController');

const router = express.Router();

// Get all categories (public)
router.get('/', categoryController.getCategories);

// Get category by ID (public)
router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid category ID')],
  validate,
  categoryController.getCategoryById
);

// Get products by category (public)
router.get(
  '/:slug/products',
  [
    param('slug').notEmpty().withMessage('Slug is required'),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  categoryController.getCategoryProducts
);

// Create category (admin only)
router.post(
  '/',
  protect,
  authorize('admin', 'super_admin'),
  uploadSingle,
  [
    body('name').notEmpty().withMessage('Category name is required'),
  ],
  validate,
  categoryController.createCategory
);

// Update category (admin only)
router.put(
  '/:id',
  protect,
  authorize('admin', 'super_admin'),
  uploadSingle,
  [param('id').isMongoId().withMessage('Invalid category ID')],
  validate,
  categoryController.updateCategory
);

// Delete category (admin only)
router.delete(
  '/:id',
  protect,
  authorize('admin', 'super_admin'),
  [param('id').isMongoId().withMessage('Invalid category ID')],
  validate,
  categoryController.deleteCategory
);

module.exports = router;
