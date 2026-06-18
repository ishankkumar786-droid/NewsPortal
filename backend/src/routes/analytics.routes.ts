import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Admin-only analytics
router.get(
  '/dashboard',
  authorize('super_admin'),
  analyticsController.getDashboardStats
);

router.get(
  '/views-over-time',
  authorize('super_admin'),
  analyticsController.getViewsOverTime
);

router.get(
  '/most-viewed',
  authorize('super_admin'),
  analyticsController.getMostViewedArticles
);

router.get(
  '/categories',
  authorize('super_admin'),
  analyticsController.getCategoryPerformance
);

router.get(
  '/reporters',
  authorize('super_admin'),
  analyticsController.getReporterPerformance
);

router.get(
  '/advertisements',
  authorize('super_admin'),
  analyticsController.getAdPerformance
);

// Reporter can see their own stats
router.get('/my-stats', authorize('reporter', 'super_admin'), analyticsController.getReporterStats);

export default router;
