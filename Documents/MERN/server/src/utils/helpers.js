/**
 * Generate slug from string
 * @param {string} str - String to slugify
 * @returns {string} Slugified string
 */
const slugify = (str) => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Generate random string
 * @param {number} length - Length of string
 * @returns {string} Random string
 */
const generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} Formatted currency
 */
const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Format date
 * @param {Date} date - Date to format
 * @param {string} format - Format type
 * @returns {string} Formatted date
 */
const formatDate = (date, format = 'full') => {
  const options = {
    full: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
    date: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    },
    short: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    },
  };

  return new Date(date).toLocaleDateString('en-US', options[format] || options.full);
};

/**
 * Calculate pagination
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @returns {object} Pagination info
 */
const calculatePagination = (page, limit, total) => {
  const currentPage = parseInt(page) || 1;
  const itemsPerPage = parseInt(limit) || 10;
  const totalPages = Math.ceil(total / itemsPerPage);
  const skip = (currentPage - 1) * itemsPerPage;

  return {
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems: total,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
    skip,
  };
};

/**
 * Filter object by allowed keys
 * @param {object} obj - Object to filter
 * @param {Array} allowedKeys - Allowed keys
 * @returns {object} Filtered object
 */
const filterObject = (obj, allowedKeys) => {
  const newObj = {};
  Object.keys(obj).forEach((key) => {
    if (allowedKeys.includes(key)) {
      newObj[key] = obj[key];
    }
  });
  return newObj;
};

/**
 * Parse pagination query
 * @param {object} query - Query object
 * @returns {object} Parsed pagination
 */
const parsePagination = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = Math.min(parseInt(query.limit) || 10, 100);
  const skip = (page - 1) * limit;
  const sort = query.sort || '-createdAt';
  
  return { page, limit, skip, sort };
};

/**
 * Parse filters from query
 * @param {object} query - Query object
 * @param {object} allowedFilters - Allowed filter fields
 * @returns {object} Parsed filters
 */
const parseFilters = (query, allowedFilters = {}) => {
  const filters = {};

  Object.keys(query).forEach((key) => {
    if (allowedFilters[key] !== undefined) {
      filters[key] = query[key];
    }
  });

  return filters;
};

/**
 * Sanitize user object (remove sensitive data)
 * @param {object} user - User object
 * @returns {object} Sanitized user
 */
const sanitizeUser = (user) => {
  const { password, __v, ...sanitized } = user.toObject ? user.toObject() : user;
  return sanitized;
};

/**
 * Deep clone object
 * @param {object} obj - Object to clone
 * @returns {object} Cloned object
 */
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if email is valid
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Check if password is strong
 * @param {string} password - Password to validate
 * @returns {object} Validation result
 */
const isStrongPassword = (password) => {
  const result = {
    isValid: true,
    errors: [],
  };

  if (password.length < 8) {
    result.isValid = false;
    result.errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    result.isValid = false;
    result.errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    result.isValid = false;
    result.errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    result.isValid = false;
    result.errors.push('Password must contain at least one number');
  }

  return result;
};

module.exports = {
  slugify,
  generateRandomString,
  formatCurrency,
  formatDate,
  calculatePagination,
  filterObject,
  parsePagination,
  parseFilters,
  sanitizeUser,
  deepClone,
  isValidEmail,
  isStrongPassword,
};
