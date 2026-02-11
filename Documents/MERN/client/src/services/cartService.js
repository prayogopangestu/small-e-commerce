import api from './api';

/**
 * Get user cart
 */
export const getCart = async () => {
  const response = await api.get('/cart');
  return response.data;
};

/**
 * Add item to cart
 */
export const addToCart = async (itemData) => {
  const response = await api.post('/cart/items', itemData);
  return response.data;
};

/**
 * Update cart item
 */
export const updateCartItem = async (itemId, quantity) => {
  const response = await api.put(`/cart/items/${itemId}`, { quantity });
  return response.data;
};

/**
 * Remove item from cart
 */
export const removeFromCart = async (itemId) => {
  const response = await api.delete(`/cart/items/${itemId}`);
  return response.data;
};

/**
 * Clear cart
 */
export const clearCart = async () => {
  const response = await api.delete('/cart');
  return response.data;
};

/**
 * Merge guest cart to user cart
 */
export const mergeCart = async (guestItems) => {
  const response = await api.post('/cart/merge', { guestItems });
  return response.data;
};
