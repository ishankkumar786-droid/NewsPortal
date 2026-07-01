import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinary.service';
import { createAuditLog } from '../services/audit.service';
import { sendSuccess, buildPaginationMeta } from '../utils/apiResponse';
import { NotFoundError, ForbiddenError, AppError } from '../utils/AppError';
import { invalidateUserCache } from '../middleware/auth.middleware';

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};
    if (req.query.role) query.role = req.query.role;
    if (req.query.isActive) query.isActive = req.query.isActive === 'true';

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(query),
    ]);

    sendSuccess(res, { users }, 'Users retrieved', 200, buildPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) throw new NotFoundError('User');
    sendSuccess(res, { user });
  } catch (error) {
    next(error);
  }
};

export const createReporter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password } = req.body as { name: string; email: string; password: string };

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) throw new AppError('Email already in use', 409);

    const reporter = await User.create({ name, email, password, role: 'reporter' });

    await createAuditLog({
      action: 'USER_CREATED',
      performedBy: req.user!.id,
      targetResource: 'User',
      targetId: reporter._id.toString(),
      details: { email: reporter.email, role: reporter.role },
      req,
    });

    sendSuccess(res, { user: reporter }, 'Reporter created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const allowedFields = ['name', 'bio', 'isActive', 'role'];
    const updateData: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    // Cannot change own role or deactivate own account
    if (id === req.user!.id) {
      delete updateData.role;
      delete updateData.isActive;
    }

    const user = await User.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
    if (!user) throw new NotFoundError('User');

    invalidateUserCache(id);

    await createAuditLog({
      action: 'USER_UPDATED',
      performedBy: req.user!.id,
      targetResource: 'User',
      targetId: id,
      req,
    });

    sendSuccess(res, { user }, 'User updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deactivateUser = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (id === req.user!.id) {
      throw new ForbiddenError('You cannot deactivate your own account');
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: { isActive: false, refreshTokens: [] } },
      { new: true }
    );

    if (!user) throw new NotFoundError('User');

    invalidateUserCache(id);

    await createAuditLog({
      action: 'USER_DEACTIVATED',
      performedBy: req.user!.id,
      targetResource: 'User',
      targetId: id,
      details: { email: user.email },
      req,
    });

    sendSuccess(res, null, 'User deactivated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (id === req.user!.id) {
      throw new ForbiddenError('You cannot delete your own account');
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) throw new NotFoundError('User');

    invalidateUserCache(id);

    await createAuditLog({
      action: 'USER_DELETED',
      performedBy: req.user!.id,
      targetResource: 'User',
      targetId: id,
      details: { email: user.email },
      req,
    });

    sendSuccess(res, null, 'User deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const uploadAvatar = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) throw new AppError('No image provided', 400);

    const user = await User.findById(req.user!.id);
    if (!user) throw new NotFoundError('User');

    // Delete existing avatar
    if (user.avatar) {
      // Extract publicId from URL (Cloudinary URL format)
      const parts = user.avatar.split('/');
      const publicIdWithExt = parts.slice(-2).join('/');
      const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');
      await deleteFromCloudinary(`news-portal/avatars/${publicId}`).catch(() => {});
    }

    const uploaded = await uploadToCloudinary(req.file.buffer, {
      folder: 'avatars',
      transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }],
    });

    const updated = await User.findByIdAndUpdate(
      req.user!.id,
      { $set: { avatar: uploaded.url } },
      { new: true }
    );

    sendSuccess(res, { user: updated }, 'Avatar uploaded successfully');
  } catch (error) {
    next(error);
  }
};

export const getReporterProfile = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    let query: Record<string, unknown>;

    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      query = { _id: new mongoose.Types.ObjectId(id), role: 'reporter' };
    } else {
      throw new NotFoundError('Reporter');
    }

    const reporter = await User.findOne(query).select('name email avatar bio createdAt');
    if (!reporter) throw new NotFoundError('Reporter');

    // Get their published articles
    const { Article } = await import('../models/Article');
    const articles = await Article.find({ author: reporter._id, status: 'published' })
      .select('title slug summary featuredImage viewCount publishDate category')
      .populate('category', 'name slug')
      .sort({ publishDate: -1 })
      .limit(20)
      .lean();

    sendSuccess(res, { reporter, articles });
  } catch (error) {
    next(error);
  }
};
