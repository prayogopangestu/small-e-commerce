import api from './api';

/**
 * Get user wishlist
 */
export const getWishlist = async () => {
  const response = await api.get('/wishlist');
  return response.data;
};

/**
 * Add item to wishlist
 */
export const addToWishlist = async (productId) => {
  const response = await api.post('/wishlist/items', { productId });
  return response.data;
};

/**
 * Remove item from wishlist
 */
export const removeFromWishlist = async (productId) => {
  const response = await api.delete(`/wishlist/items/${productId}`);
  return response.data;
};

/**
 * Clear wishlist
 */
export const clearWishlist = async () => {
  const response = await api.delete('/wishlist');
  return response.data;
};

/**
 * Move item to cart
 */
export const moveToCart = async (productId) => {
  const response = await api.post('/wishlist/move-to-cart', { productId });
  return response.data;
};
