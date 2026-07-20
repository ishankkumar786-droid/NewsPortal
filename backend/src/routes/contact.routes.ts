import { Router } from 'express';
import * as contactController from '../controllers/contact.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Public route — anyone can submit a contact form
router.post('/', contactController.submitContact);

// Admin-only routes
router.use(authenticate, authorize('super_admin'));

router.get('/', contactController.getContacts);
router.patch('/:id/read', contactController.toggleContactRead);
router.delete('/:id', contactController.deleteContact);

export default router;
