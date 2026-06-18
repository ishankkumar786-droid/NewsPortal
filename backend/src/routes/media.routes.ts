import { Router } from 'express';
import * as mediaController from '../controllers/media.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { uploadAny, handleUploadError } from '../middleware/upload.middleware';
import { uploadRateLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

router.use(authenticate);

router.get('/', authorize('reporter', 'super_admin'), mediaController.getMedia);

router.post(
  '/',
  authorize('reporter', 'super_admin'),
  uploadRateLimiter,
  uploadAny.single('file'),
  handleUploadError,
  mediaController.uploadMedia
);

router.delete('/:id', authorize('reporter', 'super_admin'), mediaController.deleteMedia);

export default router;
