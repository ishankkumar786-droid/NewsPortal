import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Article } from '../models/Article';
import { User } from '../models/User';
import { Category } from '../models/Category';
import { Advertisement } from '../models/Advertisement';
import { sendSuccess } from '../utils/apiResponse';
import { cacheWrapper } from '../services/cache.service';

export const getDashboardStats = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [
      totalArticles,
      publishedArticles,
      pendingArticles,
      totalReporters,
      totalCategories,
      totalViews,
      totalAds,
    ] = await Promise.all([
      Article.countDocuments(),
      Article.countDocuments({ status: 'published' }),
      Article.countDocuments({ status: { $in: ['submitted', 'pending_review'] } }),
      User.countDocuments({ role: 'reporter', isActive: true }),
      Category.countDocuments({ isActive: true }),
      Article.aggregate([{ $group: { _id: null, total: { $sum: '$viewCount' } } }]),
      Advertisement.countDocuments({ status: 'active' }),
    ]);

    const data = {
      totalArticles,
      publishedArticles,
      pendingArticles,
      totalReporters,
      totalCategories,
      totalViews: totalViews[0]?.total || 0,
      totalAds,
    };

    sendSuccess(res, data, 'Dashboard stats retrieved successfully', 200, undefined, undefined);
  } catch (error) {
    next(error);
  }
};

export const getReporterStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authorId = new mongoose.Types.ObjectId(req.user!.id);

    const [total, published, pending, rejected] = await Promise.all([
      Article.countDocuments({ author: authorId }),
      Article.countDocuments({ author: authorId, status: 'published' }),
      Article.countDocuments({
        author: authorId,
        status: { $in: ['submitted', 'pending_review', 'approved'] },
      }),
      Article.countDocuments({ author: authorId, status: 'rejected' }),
    ]);

    sendSuccess(res, { total, published, pending, rejected });
  } catch (error) {
    next(error);
  }
};

export const getViewsOverTime = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const cacheKey = `analytics:views-over-time:${days}`;

    const data = await cacheWrapper(cacheKey, async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const articles = await Article.find({ status: 'published' })
        .select('publishDate viewCount')
        .lean();

      const viewsByDay = new Map<string, number>();

      for (let i = 0; i < days; i++) {
        const d = new Date();
        d.setDate(d.getDate() - (days - 1 - i));
        viewsByDay.set(d.toISOString().slice(0, 10), 0);
      }

      const today = new Date();

      for (const article of articles) {
        if (!article.viewCount || article.viewCount === 0) continue;

        const articleStart = article.publishDate
          ? new Date(Math.max(new Date(article.publishDate).getTime(), startDate.getTime()))
          : startDate;

        const msPerDay = 24 * 60 * 60 * 1000;
        const activeDays = Math.max(
          1,
          Math.round((today.getTime() - articleStart.getTime()) / msPerDay) + 1
        );

        const dailyBase = Math.floor(article.viewCount / activeDays);
        const remainder = article.viewCount - dailyBase * activeDays;

        let assignedRemainder = remainder;
        for (let i = 0; i < activeDays; i++) {
          const d = new Date(articleStart.getTime() + i * msPerDay);
          const key = d.toISOString().slice(0, 10);
          if (viewsByDay.has(key)) {
            const bonus = assignedRemainder > 0 ? 1 : 0;
            viewsByDay.set(key, (viewsByDay.get(key) || 0) + dailyBase + bonus);
            if (bonus) assignedRemainder--;
          }
        }
      }

      return Array.from(viewsByDay.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([_id, views]) => ({ _id, views }));
    }, 10 * 60 * 1000);

    sendSuccess(res, { data }, 'Views over time retrieved', 200, undefined, { private: 600 });
  } catch (error) {
    next(error);
  }
};

export const getMostViewedArticles = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const limit = Math.min(20, parseInt(req.query.limit as string) || 10);

    const articles = await Article.find({ status: 'published' })
      .select('title slug viewCount publishDate category author')
      .populate('category', 'name')
      .populate('author', 'name')
      .sort({ viewCount: -1 })
      .limit(limit)
      .lean();

    sendSuccess(res, { articles });
  } catch (error) {
    next(error);
  }
};

export const getCategoryPerformance = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await cacheWrapper('analytics:category-performance', async () => {
      return Article.aggregate([
        { $match: { status: 'published' } },
        {
          $group: {
            _id: '$category',
            totalArticles: { $sum: 1 },
            totalViews: { $sum: '$viewCount' },
          },
        },
        {
          $lookup: {
            from: 'categories',
            localField: '_id',
            foreignField: '_id',
            as: 'category',
          },
        },
        { $unwind: '$category' },
        {
          $project: {
            categoryId: '$_id',
            name: '$category.name',
            slug: '$category.slug',
            color: '$category.color',
            totalArticles: 1,
            totalViews: 1,
          },
        },
        { $sort: { totalViews: -1 } },
      ]);
    }, 10 * 60 * 1000);

    sendSuccess(res, { data }, 'Category performance retrieved', 200, undefined, { private: 600 });
  } catch (error) {
    next(error);
  }
};

export const getReporterPerformance = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await cacheWrapper('analytics:reporter-performance', async () => {
      return Article.aggregate([
        { $match: { status: 'published' } },
        {
          $group: {
            _id: '$author',
            totalArticles: { $sum: 1 },
            totalViews: { $sum: '$viewCount' },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'reporter',
          },
        },
        { $unwind: '$reporter' },
        {
          $project: {
            reporterId: '$_id',
            name: '$reporter.name',
            email: '$reporter.email',
            avatar: '$reporter.avatar',
            totalArticles: 1,
            totalViews: 1,
          },
        },
        { $sort: { totalViews: -1 } },
        { $limit: 20 },
      ]);
    }, 10 * 60 * 1000);

    sendSuccess(res, { data }, 'Reporter performance retrieved', 200, undefined, { private: 600 });
  } catch (error) {
    next(error);
  }
};

export const getAdPerformance = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ads = await Advertisement.find()
      .select('title slot views clicks startDate endDate status')
      .sort({ views: -1 })
      .lean();

    const data = ads.map((ad) => ({
      ...ad,
      ctr: ad.views > 0 ? parseFloat(((ad.clicks / ad.views) * 100).toFixed(2)) : 0,
    }));

    sendSuccess(res, { data });
  } catch (error) {
    next(error);
  }
};
