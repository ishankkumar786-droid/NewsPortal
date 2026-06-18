import { Router } from 'express';
import * as adController from '../controllers/advertisement.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  CreateAdvertisementSchema,
  UpdateAdvertisementSchema,
} from '../validators/advertisement.validator';
import { uploadImage, handleUploadError } from '../middleware/upload.middleware';

const router = Router();

// Public: get active ad for a slot (for rendering on website)
router.get('/slot/:slot', adController.getActiveAdsBySlot);

// Analytics tracking (public — no auth needed)
router.post('/:id/impression', adController.trackAdImpression);
router.post('/:id/click', adController.trackAdClick);

// Admin-only routes
router.use(authenticate, authorize('super_admin'));

router.get('/', adController.getAdvertisements);

router.post(
  '/',
  uploadImage.single('image'),
  handleUploadError,
  validate(CreateAdvertisementSchema),
  adController.createAdvertisement
);

router.patch(
  '/:id',
  uploadImage.single('image'),
  handleUploadError,
  validate(UpdateAdvertisementSchema),
  adController.updateAdvertisement
);

router.delete('/:id', adController.deleteAdvertisement);

export default router;
