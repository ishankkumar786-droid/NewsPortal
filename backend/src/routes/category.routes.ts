import { Router } from 'express';
import * as categoryController from '../controllers/category.controller';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  CreateCategorySchema,
  UpdateCategorySchema,
  ReorderCategoriesSchema,
} from '../validators/category.validator';

const router = Router();

// Public routes
router.get('/', optionalAuth, categoryController.getCategories);
router.get('/slug/:slug', categoryController.getCategoryBySlug);
router.get('/:id', categoryController.getCategoryById);

// Admin-only routes
router.use(authenticate, authorize('super_admin'));

router.post('/', validate(CreateCategorySchema), categoryController.createCategory);
router.put('/reorder', validate(ReorderCategoriesSchema), categoryController.reorderCategories);
router.patch('/:id', validate(UpdateCategorySchema), categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

export default router;
