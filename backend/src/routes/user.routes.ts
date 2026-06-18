import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { uploadImage, handleUploadError } from '../middleware/upload.middleware';
import { uploadRateLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

// Public reporter profiles
router.get('/reporters/:id', userController.getReporterProfile);

// Protected routes
router.use(authenticate);

// User can upload own avatar
router.post(
  '/avatar',
  uploadRateLimiter,
  uploadImage.single('avatar'),
  handleUploadError,
  userController.uploadAvatar
);

// Admin-only routes
router.get('/', authorize('super_admin'), userController.getUsers);
router.get('/:id', authorize('super_admin'), userController.getUserById);
router.post('/reporters', authorize('super_admin'), userController.createReporter);
router.patch('/:id', authorize('super_admin'), userController.updateUser);
router.patch('/:id/deactivate', authorize('super_admin'), userController.deactivateUser);

export default router;
