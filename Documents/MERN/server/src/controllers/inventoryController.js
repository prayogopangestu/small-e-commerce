const Product = require('../models/Product');
const InventoryLog = require('../models/InventoryLog');
const { NotFoundError, BadRequestError } = require('../utils/errors');

/**
 * Get inventory overview (admin only)
 * @route GET /api/inventory
 */
exports.getInventoryOverview = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const query = {};

    if (req.query.lowStock === 'true') {
      query.$expr = { $lte: ['$stock', '$lowStockThreshold'] };
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .select('name sku stock lowStockThreshold category images')
        .populate('category', 'name')
        .sort('stock')
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

    // Calculate stats
    const stats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStock: { $sum: '$stock' },
          lowStockCount: {
            $sum: {
              $cond: [{ $lte: ['$stock', '$lowStockThreshold'] }, 1, 0],
            },
          },
          outOfStockCount: {
            $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] },
          },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        products,
        pagination,
        stats: stats[0] || {
          totalProducts: 0,
          totalStock: 0,
          lowStockCount: 0,
          outOfStockCount: 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get inventory logs (admin only)
 * @route GET /api/inventory/logs
 */
exports.getInventoryLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const query = {};

    if (req.query.productId) {
      query.productId = req.query.productId;
    }

    if (req.query.type) {
      query.type = req.query.type;
    }

    const [logs, total] = await Promise.all([
      InventoryLog.find(query)
        .populate('productId', 'name sku')
        .populate('performedBy', 'firstName lastName email')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      InventoryLog.countDocuments(query),
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
      data: { logs, pagination },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Adjust inventory (admin only)
 * @route POST /api/inventory/adjust
 */
exports.adjustInventory = async (req, res, next) => {
  try {
    const { productId, quantity, type, reason, variantId } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    const previousStock = product.stock;
    let newStock = previousStock;

    // Calculate new stock based on type
    switch (type) {
      case 'in':
        newStock = previousStock + quantity;
        break;
      case 'out':
        newStock = previousStock - quantity;
        if (newStock < 0) {
          throw new BadRequestError('Insufficient stock');
        }
        break;
      case 'adjustment':
        newStock = quantity;
        break;
      default:
        throw new BadRequestError('Invalid inventory type');
    }

    // Update product stock
    product.stock = newStock;
    await product.save();

    // Create inventory log
    await InventoryLog.create({
      productId,
      variantId,
      type,
      quantity: type === 'adjustment' ? newStock - previousStock : quantity,
      reason,
      referenceId: req.user.id,
      referenceType: 'manual',
      previousStock,
      newStock,
      performedBy: req.user.id,
    });

    res.json({
      success: true,
      message: 'Inventory adjusted successfully',
      data: {
        product,
        previousStock,
        newStock,
        adjustment: newStock - previousStock,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk update inventory (admin only)
 * @route POST /api/inventory/bulk-update
 */
exports.bulkUpdateInventory = async (req, res, next) => {
  try {
    const { updates } = req.body;

    const results = [];

    for (const update of updates) {
      const { productId, stock } = update;

      const product = await Product.findById(productId);

      if (!product) {
        results.push({
          productId,
          success: false,
          message: 'Product not found',
        });
        continue;
      }

      const previousStock = product.stock;
      product.stock = stock;
      await product.save();

      // Create inventory log
      await InventoryLog.create({
        productId,
        type: 'adjustment',
        quantity: stock - previousStock,
        reason: 'Bulk update',
        referenceId: req.user.id,
        referenceType: 'manual',
        previousStock,
        newStock: stock,
        performedBy: req.user.id,
      });

      results.push({
        productId,
        success: true,
        previousStock,
        newStock: stock,
      });
    }

    res.json({
      success: true,
      message: 'Bulk inventory update completed',
      data: { results },
    });
  } catch (error) {
    next(error);
  }
};
