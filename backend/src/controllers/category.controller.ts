import { Request, Response, NextFunction } from 'express';
import { Category } from '../models/Category';
import { createAuditLog } from '../services/audit.service';
import { sendSuccess, buildPaginationMeta } from '../utils/apiResponse';
import { NotFoundError, ConflictError } from '../utils/AppError';
import { sanitizeString } from '../utils/sanitize';
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
  ReorderCategoriesInput,
} from '../validators/category.validator';
import mongoose from 'mongoose';

export const createCategory = async (
  req: Request<any, any, CreateCategoryInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const body = req.body;

    const existing = await Category.findOne({ name: new RegExp(`^${body.name}$`, 'i') });
    if (existing) throw new ConflictError(`Category "${body.name}" already exists`);

    // Auto-assign order if not specified (place at the end)
    if (body.order === undefined) {
      const maxOrderCategory = await Category.findOne({}).sort({ order: -1 }).select('order').lean();
      body.order = (maxOrderCategory?.order ?? -1) + 1;
    }

    const category = await Category.create({
      ...body,
      name: sanitizeString(body.name),
      description: body.description ? sanitizeString(body.description) : undefined,
      createdBy: new mongoose.Types.ObjectId(req.user!.id),
    });

    await createAuditLog({
      action: 'CATEGORY_CREATED',
      performedBy: req.user!.id,
      targetResource: 'Category',
      targetId: category._id.toString(),
      details: { name: category.name },
      req,
    });

    sendSuccess(res, { category }, 'Category created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};

    // Public only sees active categories
    if (!req.user || req.user.role === 'visitor') {
      query.isActive = true;
    }

    if (req.query.parentCategory === 'null') {
      query.parentCategory = null;
    } else if (req.query.parentCategory) {
      query.parentCategory = new mongoose.Types.ObjectId(req.query.parentCategory as string);
    }

    const [categories, total] = await Promise.all([
      Category.find(query)
        .populate('parentCategory', 'name slug')
        .sort({ order: 1, name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Category.countDocuments(query),
    ]);

    const pagination = buildPaginationMeta(total, page, limit);
    const isPublic = !req.user || req.user.role === 'visitor';
    sendSuccess(res, { categories }, 'Categories retrieved successfully', 200, pagination, isPublic ? { public: 3600 } : { private: 300 });
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id).populate('parentCategory', 'name slug');
    if (!category) throw new NotFoundError('Category');
    sendSuccess(res, { category });
  } catch (error) {
    next(error);
  }
};

export const getCategoryBySlug = async (
  req: Request<{ slug: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ slug, isActive: true });
    if (!category) throw new NotFoundError('Category');
    sendSuccess(res, { category });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (
  req: Request<{ id: string }, object, UpdateCategoryInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) throw new NotFoundError('Category');

    if (req.body.name && req.body.name !== category.name) {
      const existing = await Category.findOne({
        name: new RegExp(`^${req.body.name}$`, 'i'),
        _id: { $ne: id },
      });
      if (existing) throw new ConflictError(`Category "${req.body.name}" already exists`);
    }

    const updateData = { ...req.body };
    if (updateData.name) updateData.name = sanitizeString(updateData.name);
    if (updateData.description) updateData.description = sanitizeString(updateData.description);

    const updated = await Category.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    await createAuditLog({
      action: 'CATEGORY_UPDATED',
      performedBy: req.user!.id,
      targetResource: 'Category',
      targetId: id,
      req,
    });

    sendSuccess(res, { category: updated }, 'Category updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) throw new NotFoundError('Category');

    // Check if category has articles
    const { Article } = await import('../models/Article');
    const articleCount = await Article.countDocuments({ category: id, status: 'published' });

    if (articleCount > 0) {
      throw new ConflictError(
        `Cannot delete category with ${articleCount} published articles. Move or delete articles first.`
      );
    }

    await Category.findByIdAndDelete(id);

    await createAuditLog({
      action: 'CATEGORY_DELETED',
      performedBy: req.user!.id,
      targetResource: 'Category',
      targetId: id,
      details: { name: category.name },
      req,
    });

    sendSuccess(res, null, 'Category deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const reorderCategories = async (
  req: Request<any, any, ReorderCategoriesInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { categories } = req.body;

    const bulkOps = categories.map(({ id, order }) => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(id) },
        update: { $set: { order } },
      },
    }));

    await Category.bulkWrite(bulkOps);

    sendSuccess(res, null, 'Categories reordered successfully');
  } catch (error) {
    next(error);
  }
};
