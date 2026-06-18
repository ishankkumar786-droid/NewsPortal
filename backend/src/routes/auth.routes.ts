import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { authRateLimiter, passwordResetRateLimiter } from '../middleware/rateLimit.middleware';
import {
  RegisterSchema,
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  ChangePasswordSchema,
  UpdateProfileSchema,
} from '../validators/auth.validator';

const router = Router();

// Public routes
router.post('/register', authRateLimiter, validate(RegisterSchema), authController.register);
router.post('/login', authRateLimiter, validate(LoginSchema), authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post(
  '/forgot-password',
  passwordResetRateLimiter,
  validate(ForgotPasswordSchema),
  authController.forgotPassword
);
router.post(
  '/reset-password/:token',
  passwordResetRateLimiter,
  validate(ResetPasswordSchema),
  authController.resetPassword
);

// Protected routes
router.use(authenticate);
router.post('/logout', authController.logout);
router.get('/me', authController.getMe);
router.patch('/me', validate(UpdateProfileSchema), authController.updateProfile);
router.post(
  '/change-password',
  validate(ChangePasswordSchema),
  authController.changePassword
);

export default router;
