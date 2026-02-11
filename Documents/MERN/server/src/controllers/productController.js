const Product = require('../models/Product');
const Category = require('../models/Category');
const { NotFoundError, BadRequestError } = require('../utils/errors');
const { parsePagination, parseFilters, slugify } = require('../utils/helpers');
const { uploadMultipleImages, deleteMultipleImages } = require('../config/cloudinary');

/**
 * Get all products with pagination and filters
 * @route GET /api/products
 */
exports.getProducts = async (req, res, next) => {
  try {
    const { page, limit, skip, sort } = parsePagination(req.query);
    
    // Build query
    const query = { isActive: true };

    // Apply filters
    if (req.query.category) {
      query.category = req.query.category;
    }

    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice);
    }

    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    if (req.query.isFeatured === 'true') {
      query.isFeatured = true;
    }

    // Execute query
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
        products,
        pagination,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get featured products
 * @route GET /api/products/featured
 */
exports.getFeaturedProducts = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const products = await Product.find({ isActive: true, isFeatured: true })
      .populate('category', 'name slug')
      .sort('-createdAt')
      .limit(limit);

    res.json({
      success: true,
      data: { products },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search products
 * @route GET /api/products/search
 */
exports.searchProducts = async (req, res, next) => {
  try {
    const { q, page, limit, skip } = parsePagination(req.query);

    const query = {
      $text: { $search: q },
      isActive: true,
    };

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        products,
        query: q,
        totalResults: total,
        page,
        limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get product by ID
 * @route GET /api/products/:id
 */
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    res.json({
      success: true,
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get product by slug
 * @route GET /api/products/slug/:slug
 */
exports.getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate('category', 'name slug');

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    res.json({
      success: true,
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new product (admin only)
 * @route POST /api/products
 */
exports.createProduct = async (req, res, next) => {
  try {
    const { name, price, category, ...otherData } = req.body;

    // Generate slug
    const slug = slugify(name);

    // Check if slug already exists
    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      throw new BadRequestError('Product with this name already exists');
    }

    // Upload images if provided
    let images = [];
    if (req.files && req.files.length > 0) {
      const uploadResults = await uploadMultipleImages(req.files);
      images = uploadResults.map((result) => result.secure_url);
    }

    // Create product
    const product = await Product.create({
      name,
      slug,
      price,
      category,
      images,
      ...otherData,
    });

    const populatedProduct = await Product.findById(product._id).populate('category', 'name slug');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product: populatedProduct },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update product (admin only)
 * @route PUT /api/products/:id
 */
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    const { name, images: existingImages, ...otherData } = req.body;

    // Generate new slug if name changed
    if (name && name !== product.name) {
      const slug = slugify(name);
      const existingProduct = await Product.findOne({ slug, _id: { $ne: product._id } });
      if (existingProduct) {
        throw new BadRequestError('Product with this name already exists');
      }
      otherData.slug = slug;
    }

    // Upload new images if provided
    if (req.files && req.files.length > 0) {
      const uploadResults = await uploadMultipleImages(req.files);
      otherData.images = uploadResults.map((result) => result.secure_url);
    } else if (existingImages) {
      otherData.images = existingImages;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      otherData,
      { new: true, runValidators: true }
    ).populate('category', 'name slug');

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product: updatedProduct },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete product (admin only)
 * @route DELETE /api/products/:id
 */
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      const publicIds = product.images.map((url) => {
        const parts = url.split('/');
        return parts[parts.length - 1].split('.')[0];
      });
      await deleteMultipleImages(publicIds.map((id) => `ecommerce/${id}`));
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update product stock (admin only)
 * @route PATCH /api/products/:id/stock
 */
exports.updateStock = async (req, res, next) => {
  try {
    const { stock } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { stock },
      { new: true, runValidators: true }
    );

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};
