import api from './api';

/**
 * Register a new user
 */
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

/**
 * Login user
 */
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

/**
 * Logout user
 */
export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

/**
 * Refresh access token
 */
export const refreshToken = async (refreshToken) => {
  const response = await api.post('/auth/refresh', { refreshToken });
  return response.data;
};

/**
 * Get current user
 */
export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

/**
 * Update current user
 */
export const updateMe = async (userData) => {
  const response = await api.put('/auth/me', userData);
  return response.data;
};

/**
 * Change password
 */
export const changePassword = async (passwordData) => {
  const response = await api.put('/auth/change-password', passwordData);
  return response.data;
};

/**
 * Forgot password
 */
export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

/**
 * Reset password
 */
export const resetPassword = async (token, password) => {
  const response = await api.post('/auth/reset-password', { token, password });
  return response.data;
};

/**
 * Get Google OAuth URL
 */
export const getGoogleAuthUrl = () => {
  return `${import.meta.env.VITE_API_URL}/auth/google`;
};

/**
 * Get Facebook OAuth URL
 */
export const getFacebookAuthUrl = () => {
  return `${import.meta.env.VITE_API_URL}/auth/facebook`;
};
