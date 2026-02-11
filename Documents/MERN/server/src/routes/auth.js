const express = require('express');
const passport = require('passport');
const { body } = require('express-validator');
const { authLimiter } = require('../middleware/rateLimiter');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validation');
const authController = require('../controllers/authController');

const router = express.Router();

// Register
router.post(
  '/register',
  authLimiter,
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('firstName')
      .notEmpty()
      .withMessage('First name is required')
      .trim(),
    body('lastName')
      .notEmpty()
      .withMessage('Last name is required')
      .trim(),
  ],
  validate,
  authController.register
);

// Login
router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  authController.login
);

// Logout
router.post('/logout', protect, authController.logout);

// Refresh token
router.post('/refresh', authController.refreshToken);

// Forgot password
router.post(
  '/forgot-password',
  authLimiter,
  [body('email').isEmail().withMessage('Please provide a valid email')],
  validate,
  authController.forgotPassword
);

// Reset password
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Token is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  validate,
  authController.resetPassword
);

// Get current user
router.get('/me', protect, authController.getMe);

// Update current user
router.put(
  '/me',
  protect,
  [
    body('firstName').optional().trim(),
    body('lastName').optional().trim(),
  ],
  validate,
  authController.updateMe
);

// Change password
router.put(
  '/change-password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters'),
  ],
  validate,
  authController.changePassword
);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  authController.oauthCallback
);

// Facebook OAuth
router.get(
  '/facebook',
  passport.authenticate('facebook', { scope: ['email'] })
);

router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { session: false }),
  authController.oauthCallback
);

module.exports = router;
