import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import slugify from 'slugify';
import { transliterate } from 'transliteration';
import { Article } from '../models/Article';
import { Category } from '../models/Category';
import { createAuditLog } from '../services/audit.service';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinary.service';
import { sendSuccess, buildPaginationMeta } from '../utils/apiResponse';
import { NotFoundError, ForbiddenError, AppError } from '../utils/AppError';
import { sanitizeHtml, sanitizeString } from '../utils/sanitize';
import type {
  CreateArticleInput,
  UpdateArticleInput,
  ReviewArticleInput,
  ArticleQueryInput,
} from '../validators/article.validator';

export const createArticle = async (
  req: Request<any, any, CreateArticleInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authorId = req.user!.id;
    const body = req.body;

    // Sanitize content to prevent XSS
    const sanitizedContent = sanitizeHtml(body.content);
    const sanitizedTitle = sanitizeString(body.title);
    const sanitizedSummary = sanitizeString(body.summary);

    // Verify category exists
    const category = await Category.findById(body.category);
    if (!category || !category.isActive) {
      throw new AppError('Category not found or inactive', 404);
    }

    const article = await Article.create({
      ...body,
      title: sanitizedTitle,
      summary: sanitizedSummary,
      content: sanitizedContent,
      author: new mongoose.Types.ObjectId(authorId),
      status: req.user!.role === 'super_admin' ? 'approved' : 'draft',
    });

    await createAuditLog({
      action: 'ARTICLE_CREATED',
      performedBy: authorId,
      targetResource: 'Article',
      targetId: article._id.toString(),
      details: { title: article.title, status: article.status },
      req,
    });

    sendSuccess(res, { article }, 'Article created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getArticles = async (
  req: Request<any, any, object, ArticleQueryInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '10',
      status,
      category,
      author,
      search,
      isFeatured,
      isBreaking,
      hasVideo,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const query: Record<string, unknown> = {};

    // Role-based filtering
    if (req.user?.role === 'reporter') {
      // Reporters can only see their own articles
      query.author = new mongoose.Types.ObjectId(req.user.id);
      if (status) {
        query.status = status;
      }
    } else if (req.user?.role === 'super_admin') {
      // Admin sees all statuses. If a status filter is explicitly provided,
      // narrow to it; otherwise return articles of every status (the "All" tab).
      if (status) {
        query.status = status;
      }
      if (author) query.author = new mongoose.Types.ObjectId(author);
    } else {
      // Public — only published articles
      query.status = 'published';
    }

    if (category) {
      // Support slug or ID
      if (/^[0-9a-fA-F]{24}$/.test(category)) {
        query.category = new mongoose.Types.ObjectId(category);
      } else {
        const cat = await Category.findOne({ slug: category });
        if (cat) query.category = cat._id;
      }
    }

    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured === 'true';
    }

    if (isBreaking !== undefined) {
      query.isBreaking = isBreaking === 'true';
    }

    if (hasVideo === 'true') {
      query.videoUrl = { $exists: true, $ne: '' };
    }

    if (search) {
      query.$text = { $search: search };
    }

    const sortOptions: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    const [articles, total] = await Promise.all([
      Article.find(query)
        .populate('author', 'name email avatar')
        .populate('category', 'name slug color')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Article.countDocuments(query),
    ]);

    const pagination = buildPaginationMeta(total, pageNum, limitNum);

    const isPublic = !req.user || req.user.role === 'visitor';
    // Only cache public (visitor/unauthenticated) responses.
    // Authenticated users (admin/reporter) must always get fresh data so
    // that status changes reflect immediately in the UI.
    sendSuccess(res, { articles }, 'Articles retrieved successfully', 200, pagination, isPublic ? { public: 60 } : undefined);
  } catch (error) {
    next(error);
  }
};

export const getArticleById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const query: Record<string, unknown> = { _id: id };

    // Non-admins can only view published articles
    if (!req.user || req.user.role === 'visitor') {
      query.status = 'published';
    } else if (req.user.role === 'reporter') {
      // Reporters can see their own articles in any status, plus published
      query.$or = [{ status: 'published' }, { author: new mongoose.Types.ObjectId(req.user.id) }];
    }

    const article = await Article.findOne(query)
      .populate('author', 'name email avatar bio')
      .populate('category', 'name slug color')
      .populate('reviewedBy', 'name')
      .populate('approvedBy', 'name')
      .populate('publishedBy', 'name');

    if (!article) throw new NotFoundError('Article');

    // Increment view count (non-blocking)
    Article.findByIdAndUpdate(id, { $inc: { viewCount: 1 } }).exec().catch(() => {});

    const isPublic = !req.user || req.user.role === 'visitor';
    sendSuccess(res, { article }, 'Article retrieved successfully', 200, undefined, isPublic ? { public: 300 } : undefined);
  } catch (error) {
    next(error);
  }
};

export const getArticleBySlug = async (
  req: Request<{ slug: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slug } = req.params;

    const query: Record<string, unknown> = { slug };

    // Role-based visibility:
    // - super_admin: can preview an article in any status
    // - reporter: can preview their own articles (any status) plus published
    // - everyone else (visitor / unauthenticated): published only
    if (req.user?.role === 'super_admin') {
      // no status restriction
    } else if (req.user?.role === 'reporter') {
      query.$or = [{ status: 'published' }, { author: new mongoose.Types.ObjectId(req.user.id) }];
    } else {
      query.status = 'published';
    }

    const article = await Article.findOne(query)
      .populate('author', 'name email avatar bio')
      .populate('category', 'name slug color');

    if (!article) throw new NotFoundError('Article');

    // Increment view count only for published articles (don't inflate counts on admin/author previews)
    if (article.status === 'published') {
      Article.findByIdAndUpdate(article._id, { $inc: { viewCount: 1 } }).exec().catch(() => {});
    }

    const isPublic = !req.user || req.user.role === 'visitor';
    sendSuccess(res, { article }, 'Article retrieved successfully', 200, undefined, isPublic ? { public: 300 } : undefined);
  } catch (error) {
    next(error);
  }
};

export const updateArticle = async (
  req: Request<{ id: string }, object, UpdateArticleInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const article = await Article.findById(id);
    if (!article) throw new NotFoundError('Article');

    // Reporters can only edit their own articles in editable statuses
    if (userRole === 'reporter') {
      if (article.author.toString() !== userId) {
        throw new ForbiddenError('You can only edit your own articles');
      }

      const editableStatuses = ['draft', 'rejected'];
      if (!editableStatuses.includes(article.status)) {
        throw new ForbiddenError('You cannot edit an article that has been submitted for review');
      }
    }

    const updateData: Record<string, unknown> = { ...req.body };

    if (updateData.content) {
      updateData.content = sanitizeHtml(updateData.content as string);
    }
    if (updateData.title) {
      updateData.title = sanitizeString(updateData.title as string);

      // Regenerate slug when title changes (findByIdAndUpdate bypasses pre-save hooks)
      const transliterated = transliterate(updateData.title as string);
      let baseSlug = slugify(transliterated, { lower: true, strict: true, trim: true });
      if (!baseSlug) baseSlug = id.slice(-8);
      let slug = baseSlug;
      let counter = 1;
      while (await Article.exists({ slug, _id: { $ne: id } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      updateData.slug = slug;
    }
    if (updateData.summary) {
      updateData.summary = sanitizeString(updateData.summary as string);
    }

    const updated = await Article.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('author', 'name email').populate('category', 'name slug');

    await createAuditLog({
      action: 'ARTICLE_UPDATED',
      performedBy: userId,
      targetResource: 'Article',
      targetId: id,
      details: { title: updated?.title },
      req,
    });

    sendSuccess(res, { article: updated }, 'Article updated successfully');
  } catch (error) {
    next(error);
  }
};

export const submitArticle = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const article = await Article.findById(id);
    if (!article) throw new NotFoundError('Article');

    if (article.author.toString() !== userId) {
      throw new ForbiddenError('You can only submit your own articles');
    }

    const submittableStatuses = ['draft', 'rejected'];
    if (!submittableStatuses.includes(article.status)) {
      throw new AppError(`Cannot submit article with status: ${article.status}`, 400);
    }

    const updated = await Article.findByIdAndUpdate(
      id,
      {
        $set: {
          status: 'submitted',
          submittedAt: new Date(),
        },
      },
      { new: true }
    );

    await createAuditLog({
      action: 'ARTICLE_SUBMITTED',
      performedBy: userId,
      targetResource: 'Article',
      targetId: id,
      req,
    });

    sendSuccess(res, { article: updated }, 'Article submitted for review');
  } catch (error) {
    next(error);
  }
};

export const reviewArticle = async (
  req: Request<{ id: string }, object, ReviewArticleInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { action, rejectionReason } = req.body;
    const adminId = req.user!.id;

    const article = await Article.findById(id);
    if (!article) throw new NotFoundError('Article');

    const reviewableStatuses = ['submitted', 'pending_review'];
    if (!reviewableStatuses.includes(article.status)) {
      throw new AppError(`Article must be in submitted or pending_review status to review`, 400);
    }

    const updateData: Record<string, unknown> = {
      reviewedAt: new Date(),
      reviewedBy: new mongoose.Types.ObjectId(adminId),
    };

    if (action === 'approve') {
      updateData.status = 'approved';
      updateData.approvedAt = new Date();
      updateData.approvedBy = new mongoose.Types.ObjectId(adminId);
    } else {
      updateData.status = 'rejected';
      updateData.rejectionReason = rejectionReason;
    }

    const updated = await Article.findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .populate('author', 'name email')
      .populate('category', 'name');

    await createAuditLog({
      action: action === 'approve' ? 'ARTICLE_APPROVED' : 'ARTICLE_REJECTED',
      performedBy: adminId,
      targetResource: 'Article',
      targetId: id,
      details: { action, rejectionReason },
      req,
    });

    sendSuccess(
      res,
      { article: updated },
      action === 'approve' ? 'Article approved' : 'Article rejected'
    );
  } catch (error) {
    next(error);
  }
};

export const publishArticle = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const adminId = req.user!.id;

    const article = await Article.findById(id);
    if (!article) throw new NotFoundError('Article');

    if (article.status !== 'approved') {
      throw new AppError('Article must be approved before publishing', 400);
    }

    const updated = await Article.findByIdAndUpdate(
      id,
      {
        $set: {
          status: 'published',
          publishDate: new Date(),
          publishedAt: new Date(),
          publishedBy: new mongoose.Types.ObjectId(adminId),
        },
      },
      { new: true }
    );

    // Update category article count
    Category.findByIdAndUpdate(article.category, { $inc: { articleCount: 1 } }).exec().catch(() => {});

    await createAuditLog({
      action: 'ARTICLE_PUBLISHED',
      performedBy: adminId,
      targetResource: 'Article',
      targetId: id,
      req,
    });

    sendSuccess(res, { article: updated }, 'Article published successfully');
  } catch (error) {
    next(error);
  }
};

export const scheduleArticle = async (
  req: Request<{ id: string }, object, { scheduledDate: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { scheduledDate } = req.body;
    const adminId = req.user!.id;

    const scheduledAt = new Date(scheduledDate);

    if (scheduledAt <= new Date()) {
      throw new AppError('Scheduled date must be in the future', 400);
    }

    const article = await Article.findById(id);
    if (!article) throw new NotFoundError('Article');

    if (article.status !== 'approved') {
      throw new AppError('Article must be approved before scheduling', 400);
    }

    const updated = await Article.findByIdAndUpdate(
      id,
      { $set: { status: 'scheduled', scheduledDate: scheduledAt } },
      { new: true }
    );

    await createAuditLog({
      action: 'ARTICLE_SCHEDULED',
      performedBy: adminId,
      targetResource: 'Article',
      targetId: id,
      details: { scheduledDate },
      req,
    });

    sendSuccess(res, { article: updated }, `Article scheduled for ${scheduledAt.toISOString()}`);
  } catch (error) {
    next(error);
  }
};

export const uploadFeaturedImage = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log('--- uploadFeaturedImage called for article ID:', req.params.id);
    console.log('--- req.file exists:', !!req.file);
    if (req.file) {
      console.log('--- file size:', req.file.size, 'mimetype:', req.file.mimetype);
    }
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    if (!req.file) {
      console.error('--- No image file provided in uploadFeaturedImage');
      throw new AppError('No image file provided', 400);
    }

    const article = await Article.findById(id);
    if (!article) {
      console.error('--- Article not found:', id);
      throw new NotFoundError('Article');
    }

    console.log('--- Article found, author:', article.author.toString(), 'user:', userId);

    // Permissions check
    if (userRole === 'reporter') {
      if (article.author.toString() !== userId) {
        throw new ForbiddenError('You can only upload images to your own articles');
      }
      const editableStatuses = ['draft', 'rejected'];
      if (!editableStatuses.includes(article.status)) {
        throw new ForbiddenError('You cannot edit an article that has been submitted');
      }
    }

    // Delete old featured image if it exists
    if (article.featuredImage?.publicId) {
      await deleteFromCloudinary(article.featuredImage.publicId).catch(() => {});
    }

    // Upload new image
    const uploaded = await uploadToCloudinary(req.file.buffer, {
      folder: 'articles',
      resourceType: 'image',
    });

    const updated = await Article.findByIdAndUpdate(
      id,
      {
        $set: {
          featuredImage: {
            url: uploaded.url,
            publicId: uploaded.publicId,
            alt: req.body.alt || article.title,
          },
        },
      },
      { new: true }
    );

    await createAuditLog({
      action: 'ARTICLE_UPDATED',
      performedBy: userId,
      targetResource: 'Article',
      targetId: id,
      details: { action: 'upload_featured_image' },
      req,
    });

    sendSuccess(res, { article: updated }, 'Featured image uploaded successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteArticle = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const article = await Article.findById(id);
    if (!article) throw new NotFoundError('Article');

    // Reporters can only delete their own draft articles
    if (userRole === 'reporter') {
      if (article.author.toString() !== userId) {
        throw new ForbiddenError('You can only delete your own articles');
      }
      if (article.status !== 'draft') {
        throw new ForbiddenError('You can only delete draft articles');
      }
    }

    // Delete associated images from Cloudinary
    const deletions: Promise<void>[] = [];

    if (article.featuredImage?.publicId) {
      deletions.push(deleteFromCloudinary(article.featuredImage.publicId));
    }

    article.galleryImages.forEach((img) => {
      if (img.publicId) {
        deletions.push(deleteFromCloudinary(img.publicId));
      }
    });

    await Promise.allSettled(deletions);

    await Article.findByIdAndDelete(id);

    if (article.status === 'published') {
      Category.findByIdAndUpdate(article.category, { $inc: { articleCount: -1 } }).exec().catch(() => {});
    }

    await createAuditLog({
      action: 'ARTICLE_DELETED',
      performedBy: userId,
      targetResource: 'Article',
      targetId: id,
      details: { title: article.title },
      req,
    });

    sendSuccess(res, null, 'Article deleted successfully');
  } catch (error) {
    next(error);
  }
};
