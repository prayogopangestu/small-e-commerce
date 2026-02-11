import api from './api';

/**
 * Get all categories
 */
export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

/**
 * Get category by ID
 */
export const getCategoryById = async (id) => {
  const response = await api.get(`/categories/${id}`);
  return response.data;
};

/**
 * Get products by category
 */
export const getCategoryProducts = async (slug, params = {}) => {
  const response = await api.get(`/categories/${slug}/products`, { params });
  return response.data;
};
