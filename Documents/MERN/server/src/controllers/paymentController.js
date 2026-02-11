const Order = require('../models/Order');
const { createPaymentIntent, retrievePaymentIntent, constructWebhookEvent } = require('../config/stripe');
const { NotFoundError, BadRequestError } = require('../utils/errors');

/**
 * Create payment intent
 * @route POST /api/payments/create-intent
 */
exports.createPaymentIntent = async (req, res, next) => {
  try {
    const { amount, currency = 'usd' } = req.body;

    // Create payment intent
    const paymentIntent = await createPaymentIntent(amount, currency, {
      userId: req.user.id,
    });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Confirm payment
 * @route POST /api/payments/confirm
 */
exports.confirmPayment = async (req, res, next) => {
  try {
    const { paymentIntentId, paymentMethodId } = req.body;

    // Retrieve payment intent
    const paymentIntent = await retrievePaymentIntent(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      throw new BadRequestError('Payment already confirmed');
    }

    // Confirm payment
    const confirmedIntent = await retrievePaymentIntent(paymentIntentId);

    // Update order payment status
    const order = await Order.findOne({ paymentId: paymentIntentId });

    if (order) {
      order.paymentStatus = 'paid';
      order.status = 'confirmed';
      await order.save();
    }

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      data: {
        paymentId: confirmedIntent.id,
        status: confirmedIntent.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Stripe webhook handler
 * @route POST /api/payments/webhook
 */
exports.webhook = async (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature'];
    const payload = req.body;

    // Construct webhook event
    const event = await constructWebhookEvent(payload, sig);

    // Handle event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: 'Webhook error' });
  }
};

/**
 * Handle payment succeeded event
 */
async function handlePaymentSucceeded(paymentIntent) {
  try {
    const order = await Order.findOne({ paymentId: paymentIntent.id });

    if (order) {
      order.paymentStatus = 'paid';
      order.status = 'confirmed';
      await order.save();

      console.log(`Order ${order.orderNumber} payment succeeded`);
    }
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

/**
 * Handle payment failed event
 */
async function handlePaymentFailed(paymentIntent) {
  try {
    const order = await Order.findOne({ paymentId: paymentIntent.id });

    if (order) {
      order.paymentStatus = 'failed';
      await order.save();

      console.log(`Order ${order.orderNumber} payment failed`);
    }
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

/**
 * Handle payment canceled event
 */
async function handlePaymentCanceled(paymentIntent) {
  try {
    const order = await Order.findOne({ paymentId: paymentIntent.id });

    if (order) {
      order.paymentStatus = 'failed';
      await order.save();

      console.log(`Order ${order.orderNumber} payment canceled`);
    }
  } catch (error) {
    console.error('Error handling payment canceled:', error);
  }
}

/**
 * Get payment status
 * @route GET /api/payments/:orderId
 */
exports.getPaymentStatus = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      userId: req.user.id,
    }).select('paymentStatus paymentMethod paymentId total');

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    res.json({
      success: true,
      data: { payment: order },
    });
  } catch (error) {
    next(error);
  }
};
