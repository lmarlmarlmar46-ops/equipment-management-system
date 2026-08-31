import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimiter';
import { validateRequest } from '../middleware/validator';
import { body } from 'express-validator';

const router = Router();

// Validation schemas
const registerValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('employeeId').notEmpty().withMessage('Employee ID is required'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number and special character'),
  validateRequest
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validateRequest
];

const mfaValidation = [
  body('sessionId').notEmpty().withMessage('Session ID is required'),
  body('otpCode').isLength({ min: 6, max: 6 }).withMessage('OTP code must be 6 digits'),
  validateRequest
];

const forgotPasswordValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  validateRequest
];

const resetPasswordValidation = [
  body('resetToken').notEmpty().withMessage('Reset token is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  validateRequest
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters'),
  validateRequest
];

// Routes
router.post(
  '/register',
  authRateLimiter,
  registerValidation,
  authController.register.bind(authController)
);

router.post(
  '/login',
  authRateLimiter,
  loginValidation,
  authController.login.bind(authController)
);

router.post(
  '/mfa/verify',
  authRateLimiter,
  mfaValidation,
  authController.verifyMfa.bind(authController)
);

router.post(
  '/refresh',
  authController.refreshToken.bind(authController)
);

router.post(
  '/logout',
  authenticate,
  authController.logout.bind(authController)
);

router.post(
  '/forgot-password',
  authRateLimiter,
  forgotPasswordValidation,
  authController.forgotPassword.bind(authController)
);

router.post(
  '/reset-password',
  authRateLimiter,
  resetPasswordValidation,
  authController.resetPassword.bind(authController)
);

router.post(
  '/change-password',
  authenticate,
  changePasswordValidation,
  authController.changePassword.bind(authController)
);

export default router;
