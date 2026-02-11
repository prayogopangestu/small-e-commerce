const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const { NotFoundError, BadRequestError } = require('../utils/errors');

/**
 * Get user orders
 * @route GET /api/orders
 */
exports.getUserOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const skip = (page - 1) * limit;

    const query = { userId: req.user.id };

    if (req.query.status) {
      query.status = req.query.status;
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query),
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
      data: { orders, pagination },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get order by ID
 * @route GET /api/orders/:id
 */
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.id,
    }).populate('items.productId', 'name images');

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    res.json({
      success: true,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create order
 * @route POST /api/orders
 */
exports.createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, billingAddress, couponCode, notes } = req.body;

    // Get user cart
    const cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      throw new BadRequestError('Cart is empty');
    }

    // Verify stock and calculate totals
    const orderItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      if (!product || product.stock < item.quantity) {
        throw new BadRequestError(`Product "${product?.name || 'Unknown'}" is out of stock`);
      }

      const totalPrice = item.price * item.quantity;
      subtotal += totalPrice;

      orderItems.push({
        productId: item.productId,
        name: product.name,
        image: product.images[0] || null,
        quantity: item.quantity,
        price: item.price,
        totalPrice,
      });
    }

    // Calculate shipping and tax (simplified)
    const shippingCost = 0; // Free shipping for now
    const tax = subtotal * 0.1; // 10% tax
    const discount = cart.couponDiscount || 0;
    const total = subtotal + shippingCost + tax - discount;

    // Create order
    const order = await Order.create({
      userId: req.user.id,
      items: orderItems,
      subtotal,
      shippingCost,
      tax,
      discount,
      total,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      notes,
      couponCode: cart.couponCode,
      couponDiscount: cart.couponDiscount,
      status: 'pending',
      paymentStatus: 'pending',
    });

    // Clear cart
    cart.items = [];
    cart.couponCode = null;
    cart.couponDiscount = 0;
    await cart.save();

    const populatedOrder = await Order.findById(order._id).populate('items.productId', 'name images');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order: populatedOrder },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel order
 * @route POST /api/orders/:id/cancel
 */
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.status === 'cancelled' || order.status === 'delivered') {
      throw new BadRequestError('Cannot cancel this order');
    }

    order.status = 'cancelled';
    await order.save();

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
      });
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Track order
 * @route GET /api/orders/:id/track
 */
exports.trackOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.id,
    }).select('orderNumber status trackingNumber createdAt updatedAt');

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    res.json({
      success: true,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all orders (admin only)
 * @route GET /api/orders/admin/all
 */
exports.getAllOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const skip = (page - 1) * limit;

    const query = {};

    if (req.query.status) {
      query.status = req.query.status;
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('userId', 'email firstName lastName')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query),
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
      data: { orders, pagination },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update order status (admin only)
 * @route PUT /api/orders/admin/:id/status
 */
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Handle status transitions
    if (status === 'processing' && order.status !== 'confirmed') {
      throw new BadRequestError('Order must be confirmed before processing');
    }

    if (status === 'shipped' && order.status !== 'processing') {
      throw new BadRequestError('Order must be processing before shipping');
    }

    if (status === 'delivered' && order.status !== 'shipped') {
      throw new BadRequestError('Order must be shipped before delivery');
    }

    // Update stock based on status
    if (status === 'confirmed' && order.status === 'pending') {
      // Deduct stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity },
        });
      }
    }

    if (status === 'cancelled' && order.status !== 'cancelled') {
      // Restore stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity },
        });
      }
    }

    order.status = status;
    await order.save();

    const populatedOrder = await Order.findById(order._id).populate('items.productId', 'name images');

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order: populatedOrder },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add tracking info (admin only)
 * @route PUT /api/orders/admin/:id/tracking
 */
exports.addTrackingInfo = async (req, res, next) => {
  try {
    const { trackingNumber } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    order.trackingNumber = trackingNumber;
    await order.save();

    res.json({
      success: true,
      message: 'Tracking info added successfully',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};
