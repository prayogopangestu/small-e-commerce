const Category = require('../models/Category');
const Product = require('../models/Product');
const { NotFoundError, BadRequestError } = require('../utils/errors');
const { parsePagination, slugify } = require('../utils/helpers');
const { uploadSingle, deleteImage } = require('../config/cloudinary');

/**
 * Get all categories
 * @route GET /api/categories
 */
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate('subcategories', 'name slug')
      .sort({ order: 1, name: 1 });

    res.json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get category by ID
 * @route GET /api/categories/:id
 */
exports.getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id).populate('subcategories', 'name slug');

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    res.json({
      success: true,
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get products by category slug
 * @route GET /api/categories/:slug/products
 */
exports.getCategoryProducts = async (req, res, next) => {
  try {
    const { page, limit, skip, sort } = parsePagination(req.query);

    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    const query = { 
      category: category._id, 
      isActive: true 
    };

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Product.countDocuments(query),
    ]);

    const pagination = {
      currentPage: page,
      itemsPerPage: limit,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    };

    res.json({
      success: true,
      data: {
        category,
        products,
        pagination,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new category (admin only)
 * @route POST /api/categories
 */
exports.createCategory = async (req, res, next) => {
  try {
    const { name, parentId, ...otherData } = req.body;

    // Generate slug
    const slug = slugify(name);

    // Check if slug already exists
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      throw new BadRequestError('Category with this name already exists');
    }

    // Upload image if provided
    let image = null;
    if (req.file) {
      const uploadResult = await uploadSingle(req.file);
      image = uploadResult.secure_url;
    }

    const category = await Category.create({
      name,
      slug,
      parentId,
      image,
      ...otherData,
    });

    const populatedCategory = await Category.findById(category._id).populate('subcategories', 'name slug');

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category: populatedCategory },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update category (admin only)
 * @route PUT /api/categories/:id
 */
exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    const { name, ...otherData } = req.body;

    // Generate new slug if name changed
    if (name && name !== category.name) {
      const slug = slugify(name);
      const existingCategory = await Category.findOne({ slug, _id: { $ne: category._id } });
      if (existingCategory) {
        throw new BadRequestError('Category with this name already exists');
      }
      otherData.slug = slug;
    }

    // Upload new image if provided
    if (req.file) {
      const uploadResult = await uploadSingle(req.file);
      otherData.image = uploadResult.secure_url;
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      otherData,
      { new: true, runValidators: true }
    ).populate('subcategories', 'name slug');

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: { category: updatedCategory },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete category (admin only)
 * @route DELETE /api/categories/:id
 */
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    // Check if category has products
    const productCount = await Product.countDocuments({ category: category._id });
    if (productCount > 0) {
      throw new BadRequestError('Cannot delete category with existing products');
    }

    await Category.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
