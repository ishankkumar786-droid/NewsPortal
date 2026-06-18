import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { getAuditLogs } from '../services/audit.service';
import { sendSuccess, buildPaginationMeta } from '../utils/apiResponse';
import type { AuditAction } from '../models/AuditLog';

const router = Router();

router.use(authenticate, authorize('super_admin'));

router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));

    const filters: {
      performedBy?: string;
      action?: AuditAction;
      targetResource?: string;
      startDate?: Date;
      endDate?: Date;
    } = {};

    if (req.query.performedBy) filters.performedBy = req.query.performedBy as string;
    if (req.query.action) filters.action = req.query.action as AuditAction;
    if (req.query.targetResource) filters.targetResource = req.query.targetResource as string;
    if (req.query.startDate) filters.startDate = new Date(req.query.startDate as string);
    if (req.query.endDate) filters.endDate = new Date(req.query.endDate as string);

    const { logs, total } = await getAuditLogs(filters, page, limit);

    sendSuccess(
      res,
      { logs },
      'Audit logs retrieved',
      200,
      buildPaginationMeta(total, page, limit)
    );
  } catch (error) {
    next(error);
  }
});

export default router;
