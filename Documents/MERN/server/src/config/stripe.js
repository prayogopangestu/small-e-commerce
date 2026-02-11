const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Create a payment intent
 * @param {number} amount - Amount in cents
 * @param {string} currency - Currency code (default: 'usd')
 * @param {object} metadata - Additional metadata
 * @returns {Promise<object>} Payment intent
 */
const createPaymentIntent = async (amount, currency = 'usd', metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return paymentIntent;
  } catch (error) {
    throw new Error(`Stripe payment intent error: ${error.message}`);
  }
};

/**
 * Retrieve a payment intent
 * @param {string} paymentIntentId - Payment intent ID
 * @returns {Promise<object>} Payment intent
 */
const retrievePaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    throw new Error(`Stripe retrieve error: ${error.message}`);
  }
};

/**
 * Confirm a payment intent
 * @param {string} paymentIntentId - Payment intent ID
 * @param {string} paymentMethodId - Payment method ID
 * @returns {Promise<object>} Payment intent
 */
const confirmPaymentIntent = async (paymentIntentId, paymentMethodId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    });

    return paymentIntent;
  } catch (error) {
    throw new Error(`Stripe confirm error: ${error.message}`);
  }
};

/**
 * Create a refund
 * @param {string} paymentIntentId - Payment intent ID
 * @param {number} amount - Amount to refund in cents (optional, full refund if not provided)
 * @returns {Promise<object>} Refund
 */
const createRefund = async (paymentIntentId, amount = null) => {
  try {
    const refundData = {
      payment_intent: paymentIntentId,
    };

    if (amount) {
      refundData.amount = Math.round(amount * 100);
    }

    const refund = await stripe.refunds.create(refundData);
    return refund;
  } catch (error) {
    throw new Error(`Stripe refund error: ${error.message}`);
  }
};

/**
 * Construct a webhook event
 * @param {string} payload - Raw request body
 * @param {string} signature - Stripe signature header
 * @returns {Promise<object>} Webhook event
 */
const constructWebhookEvent = async (payload, signature) => {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    return event;
  } catch (error) {
    throw new Error(`Stripe webhook error: ${error.message}`);
  }
};

/**
 * Create a customer
 * @param {string} email - Customer email
 * @param {string} name - Customer name
 * @returns {Promise<object>} Customer
 */
const createCustomer = async (email, name) => {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
    });

    return customer;
  } catch (error) {
    throw new Error(`Stripe customer error: ${error.message}`);
  }
};

/**
 * Retrieve a customer
 * @param {string} customerId - Customer ID
 * @returns {Promise<object>} Customer
 */
const retrieveCustomer = async (customerId) => {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    return customer;
  } catch (error) {
    throw new Error(`Stripe retrieve customer error: ${error.message}`);
  }
};

module.exports = {
  stripe,
  createPaymentIntent,
  retrievePaymentIntent,
  confirmPaymentIntent,
  createRefund,
  constructWebhookEvent,
  createCustomer,
  retrieveCustomer,
};
