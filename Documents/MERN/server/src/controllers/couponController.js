const Coupon = require('../models/Coupon');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { NotFoundError, BadRequestError } = require('../utils/errors');

/**
 * Validate coupon code
 * @route POST /api/coupons/validate
 */
exports.validateCoupon = async (req, res, next) => {
  try {
    const { code, cartTotal } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      throw new BadRequestError('Invalid coupon code');
    }

    // Check if coupon is valid
    if (!coupon.isActive) {
      throw new BadRequestError('Coupon is not active');
    }

    if (coupon.isExpired) {
      throw new BadRequestError('Coupon has expired');
    }

    if (coupon.isUsageLimitReached) {
      throw new BadRequestError('Coupon usage limit has been reached');
    }

    // Check minimum order amount
    if (cartTotal < coupon.minOrderAmount) {
      throw new BadRequestError(
        `Minimum order amount of ${coupon.minOrderAmount} required`
      );
    }

    // Calculate discount
    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = (cartTotal * coupon.value) / 100;
      if (coupon.maxDiscountAmount) {
        discount = Math.min(discount, coupon.maxDiscountAmount);
      }
    } else {
      discount = coupon.value;
    }

    res.json({
      success: true,
      data: {
        coupon: {
          code: coupon.code,
          type: coupon.type,
          value: coupon.value,
          discount: Math.round(discount * 100) / 100,
          minOrderAmount: coupon.minOrderAmount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all coupons (admin only)
 * @route GET /api/coupons/admin/all
 */
exports.getAllCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort('-createdAt');

    res.json({
      success: true,
      data: { coupons },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get coupon by ID (admin only)
 * @route GET /api/coupons/admin/:id
 */
exports.getCouponById = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      throw new NotFoundError('Coupon not found');
    }

    res.json({
      success: true,
      data: { coupon },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create coupon (admin only)
 * @route POST /api/coupons/admin
 */
exports.createCoupon = async (req, res, next) => {
  try {
    const {
      code,
      type,
      value,
      minOrderAmount,
      maxDiscountAmount,
      usageLimit,
      validFrom,
      validUntil,
      applicableCategories,
      applicableProducts,
      description,
    } = req.body;

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      throw new BadRequestError('Coupon code already exists');
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      type,
      value,
      minOrderAmount,
      maxDiscountAmount,
      usageLimit,
      validFrom,
      validUntil,
      applicableCategories,
      applicableProducts,
      description,
    });

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: { coupon },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update coupon (admin only)
 * @route PUT /api/coupons/admin/:id
 */
exports.updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      throw new NotFoundError('Coupon not found');
    }

    const { code, ...otherData } = req.body;

    // Check if new code already exists
    if (code && code.toUpperCase() !== coupon.code) {
      const existingCoupon = await Coupon.findOne({
        code: code.toUpperCase(),
        _id: { $ne: coupon._id },
      });
      if (existingCoupon) {
        throw new BadRequestError('Coupon code already exists');
      }
      otherData.code = code.toUpperCase();
    }

    const updatedCoupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      otherData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Coupon updated successfully',
      data: { coupon: updatedCoupon },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete coupon (admin only)
 * @route DELETE /api/coupons/admin/:id
 */
exports.deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      throw new NotFoundError('Coupon not found');
    }

    await Coupon.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Coupon deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
