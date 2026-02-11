import api from './api';

/**
 * Get user orders
 */
export const getUserOrders = async (params = {}) => {
  const response = await api.get('/orders', { params });
  return response.data;
};

/**
 * Get order by ID
 */
export const getOrderById = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

/**
 * Create order
 */
export const createOrder = async (orderData) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

/**
 * Cancel order
 */
export const cancelOrder = async (id) => {
  const response = await api.post(`/orders/${id}/cancel`);
  return response.data;
};

/**
 * Track order
 */
export const trackOrder = async (id) => {
  const response = await api.get(`/orders/${id}/track`);
  return response.data;
};

/**
 * Get all orders (admin)
 */
export const getAllOrders = async (params = {}) => {
  const response = await api.get('/orders/admin/all', { params });
  return response.data;
};

/**
 * Update order status (admin)
 */
export const updateOrderStatus = async (id, status) => {
  const response = await api.put(`/orders/admin/${id}/status`, { status });
  return response.data;
};

/**
 * Add tracking info (admin)
 */
export const addTrackingInfo = async (id, trackingNumber) => {
  const response = await api.put(`/orders/admin/${id}/tracking`, { trackingNumber });
  return response.data;
};
