import api from './api';

/**
 * Create payment intent
 */
export const createPaymentIntent = async (amount, currency = 'usd') => {
  const response = await api.post('/payments/create-intent', { amount, currency });
  return response.data;
};

/**
 * Confirm payment
 */
export const confirmPayment = async (paymentIntentId, paymentMethodId) => {
  const response = await api.post('/payments/confirm', { paymentIntentId, paymentMethodId });
  return response.data;
};

/**
 * Get payment status
 */
export const getPaymentStatus = async (orderId) => {
  const response = await api.get(`/payments/${orderId}`);
  return response.data;
};
