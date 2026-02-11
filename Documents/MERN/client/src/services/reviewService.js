import api from './api';

/**
 * Get product reviews
 */
export const getProductReviews = async (productId, params = {}) => {
  const response = await api.get(`/reviews/products/${productId}`, { params });
  return response.data;
};

/**
 * Create review
 */
export const createReview = async (productId, reviewData) => {
  const response = await api.post(`/reviews/products/${productId}`, reviewData);
  return response.data;
};

/**
 * Update review
 */
export const updateReview = async (reviewId, reviewData) => {
  const response = await api.put(`/reviews/${reviewId}`, reviewData);
  return response.data;
};

/**
 * Delete review
 */
export const deleteReview = async (reviewId) => {
  const response = await api.delete(`/reviews/${reviewId}`);
  return response.data;
};

/**
 * Mark review as helpful
 */
export const markReviewHelpful = async (reviewId) => {
  const response = await api.post(`/reviews/${reviewId}/helpful`);
  return response.data;
};
