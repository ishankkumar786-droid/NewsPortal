import { Request } from 'express';
import mongoose from 'mongoose';
import { AuditLog, AuditAction } from '../models/AuditLog';
import { logger } from '../utils/logger';

interface AuditOptions {
  action: AuditAction;
  performedBy: string;
  targetResource?: string;
  targetId?: string;
  details?: Record<string, unknown>;
  req?: Request;
}

export const createAuditLog = async (options: AuditOptions): Promise<void> => {
  try {
    await AuditLog.create({
      action: options.action,
      performedBy: new mongoose.Types.ObjectId(options.performedBy),
      targetResource: options.targetResource,
      targetId: options.targetId ? new mongoose.Types.ObjectId(options.targetId) : undefined,
      details: options.details,
      ipAddress: options.req?.ip || options.req?.socket?.remoteAddress,
      userAgent: options.req?.headers['user-agent'],
    });
  } catch (error) {
    // Audit log failures should not break the main operation
    logger.error('Failed to create audit log:', error);
  }
};

export const getAuditLogs = async (
  filters: {
    performedBy?: string;
    action?: AuditAction;
    targetResource?: string;
    startDate?: Date;
    endDate?: Date;
  },
  page = 1,
  limit = 50
) => {
  const query: Record<string, unknown> = {};

  if (filters.performedBy) {
    query.performedBy = new mongoose.Types.ObjectId(filters.performedBy);
  }
  if (filters.action) {
    query.action = filters.action;
  }
  if (filters.targetResource) {
    query.targetResource = filters.targetResource;
  }
  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) {
      (query.createdAt as Record<string, unknown>).$gte = filters.startDate;
    }
    if (filters.endDate) {
      (query.createdAt as Record<string, unknown>).$lte = filters.endDate;
    }
  }

  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    AuditLog.find(query)
      .populate('performedBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    AuditLog.countDocuments(query),
  ]);

  return { logs, total };
};
