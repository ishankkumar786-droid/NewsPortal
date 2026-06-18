import { Router } from 'express';
import * as articleController from '../controllers/article.controller';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  CreateArticleSchema,
  UpdateArticleSchema,
  ReviewArticleSchema,
  ArticleQuerySchema,
} from '../validators/article.validator';
import { uploadImage, handleUploadError } from '../middleware/upload.middleware';

const router = Router();

// Public routes (with optional auth for role-based filtering)
router.get('/', optionalAuth, validate(ArticleQuerySchema), articleController.getArticles);
router.get('/slug/:slug', optionalAuth, articleController.getArticleBySlug);
router.get('/:id', optionalAuth, articleController.getArticleById);

// Protected: Reporters and Admins
router.use(authenticate);

router.post(
  '/',
  authorize('reporter', 'super_admin'),
  validate(CreateArticleSchema),
  articleController.createArticle
);

router.patch(
  '/:id',
  authorize('reporter', 'super_admin'),
  validate(UpdateArticleSchema),
  articleController.updateArticle
);

router.delete(
  '/:id',
  authorize('reporter', 'super_admin'),
  articleController.deleteArticle
);

// Reporter: Submit for review
router.post(
  '/:id/submit',
  authorize('reporter', 'super_admin'),
  articleController.submitArticle
);

// Admin-only actions
router.post(
  '/:id/review',
  authorize('super_admin'),
  validate(ReviewArticleSchema),
  articleController.reviewArticle
);

router.post(
  '/:id/publish',
  authorize('super_admin'),
  articleController.publishArticle
);

router.post(
  '/:id/schedule',
  authorize('super_admin'),
  articleController.scheduleArticle
);

// Featured image upload for article
router.post(
  '/:id/featured-image',
  authorize('reporter', 'super_admin'),
  uploadImage.single('image'),
  handleUploadError,
  articleController.uploadFeaturedImage
);

export default router;
