import api from './api';

/**
 * Get all products
 */
export const getProducts = async (params = {}) => {
  const response = await api.get('/products', { params });
  return response.data;
};

/**
 * Get featured products
 */
export const getFeaturedProducts = async (limit = 10) => {
  const response = await api.get('/products/featured', { params: { limit } });
  return response.data;
};

/**
 * Search products
 */
export const searchProducts = async (query, params = {}) => {
  const response = await api.get('/products/search', { params: { q: query, ...params } });
  return response.data;
};

/**
 * Get product by ID
 */
export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

/**
 * Get product by slug
 */
export const getProductBySlug = async (slug) => {
  const response = await api.get(`/products/slug/${slug}`);
  return response.data;
};
