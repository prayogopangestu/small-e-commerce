const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { NotFoundError, BadRequestError } = require('../utils/errors');

/**
 * Get user cart
 * @route GET /api/cart
 */
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId', 'name images price stock');

    if (!cart) {
      cart = await Cart.create({ userId: req.user.id, items: [] });
    }

    res.json({
      success: true,
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add item to cart
 * @route POST /api/cart/items
 */
exports.addItem = async (req, res, next) => {
  try {
    const { productId, quantity, variantId } = req.body;

    // Verify product exists and is active
    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Check stock
    if (product.stock < quantity) {
      throw new BadRequestError('Not enough stock available');
    }

    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      cart = await Cart.create({
        userId: req.user.id,
        items: [],
      });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId && 
      (variantId ? item.variantId?.toString() === variantId : !item.variantId)
    );

    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        productId,
        variantId,
        quantity,
        price: product.price,
      });
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('items.productId', 'name images price stock');

    res.json({
      success: true,
      message: 'Item added to cart',
      data: { cart: populatedCart },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update cart item quantity
 * @route PUT /api/cart/items/:itemId
 */
exports.updateItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;

    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      throw new NotFoundError('Cart not found');
    }

    const item = cart.items.id(req.params.itemId);
    if (!item) {
      throw new NotFoundError('Item not found in cart');
    }

    // Verify stock
    const product = await Product.findById(item.productId);
    if (product.stock < quantity) {
      throw new BadRequestError('Not enough stock available');
    }

    item.quantity = quantity;
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('items.productId', 'name images price stock');

    res.json({
      success: true,
      message: 'Cart item updated',
      data: { cart: populatedCart },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove item from cart
 * @route DELETE /api/cart/items/:itemId
 */
exports.removeItem = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      throw new NotFoundError('Cart not found');
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== req.params.itemId);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('items.productId', 'name images price stock');

    res.json({
      success: true,
      message: 'Item removed from cart',
      data: { cart: populatedCart },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Clear cart
 * @route DELETE /api/cart
 */
exports.clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { userId: req.user.id },
      { items: [], couponCode: null, couponDiscount: 0 },
      { new: true }
    ).populate('items.productId', 'name images price stock');

    res.json({
      success: true,
      message: 'Cart cleared',
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Merge guest cart to user cart
 * @route POST /api/cart/merge
 */
exports.mergeCart = async (req, res, next) => {
  try {
    const { guestItems } = req.body;

    if (!guestItems || guestItems.length === 0) {
      return res.json({
        success: true,
        message: 'No items to merge',
        data: { cart: req.cart },
      });
    }

    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      cart = await Cart.create({
        userId: req.user.id,
        items: [],
      });
    }

    // Merge guest items
    for (const guestItem of guestItems) {
      const product = await Product.findOne({ _id: guestItem.productId, isActive: true });
      if (!product) continue;

      const existingItemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === guestItem.productId
      );

      if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity += guestItem.quantity;
      } else {
        cart.items.push({
          productId: guestItem.productId,
          quantity: guestItem.quantity,
          price: product.price,
        });
      }
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('items.productId', 'name images price stock');

    res.json({
      success: true,
      message: 'Cart merged successfully',
      data: { cart: populatedCart },
    });
  } catch (error) {
    next(error);
  }
};
