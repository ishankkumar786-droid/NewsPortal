import { z } from 'zod';

const ArticleStatusEnum = z.enum([
  'draft',
  'submitted',
  'pending_review',
  'approved',
  'published',
  'rejected',
  'scheduled',
]);

export const CreateArticleSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: 'Title is required' })
      .min(10, 'Title must be at least 10 characters')
      .max(300, 'Title cannot exceed 300 characters')
      .trim(),
    summary: z
      .string({ required_error: 'Summary is required' })
      .min(20, 'Summary must be at least 20 characters')
      .max(500, 'Summary cannot exceed 500 characters')
      .trim(),
    content: z
      .string({ required_error: 'Content is required' })
      .min(50, 'Content must be at least 50 characters'),
    category: z
      .string({ required_error: 'Category is required' })
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID'),
    tags: z
      .array(z.string().trim().max(50, 'Tag cannot exceed 50 characters'))
      .max(20, 'Cannot have more than 20 tags')
      .optional()
      .default([]),
    videoUrl: z
      .string()
      .url('Please provide a valid URL')
      .optional(),
    isBreaking: z.boolean().optional().default(false),
    isFeatured: z.boolean().optional().default(false),
    seoTitle: z.string().max(70, 'SEO title cannot exceed 70 characters').optional(),
    seoDescription: z
      .string()
      .max(160, 'SEO description cannot exceed 160 characters')
      .optional(),
    scheduledDate: z.string().datetime().optional(),
  }),
});

export const UpdateArticleSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid article ID'),
  }),
  body: z.object({
    title: z
      .string()
      .min(10, 'Title must be at least 10 characters')
      .max(300, 'Title cannot exceed 300 characters')
      .trim()
      .optional(),
    summary: z
      .string()
      .min(20, 'Summary must be at least 20 characters')
      .max(500, 'Summary cannot exceed 500 characters')
      .trim()
      .optional(),
    content: z.string().min(50, 'Content must be at least 50 characters').optional(),
    category: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID')
      .optional(),
    tags: z
      .array(z.string().trim().max(50))
      .max(20, 'Cannot have more than 20 tags')
      .optional(),
    videoUrl: z.string().url('Please provide a valid URL').optional().nullable(),
    isBreaking: z.union([z.boolean(), z.string()]).optional(),
    isFeatured: z.union([z.boolean(), z.string()]).optional(),
    seoTitle: z.string().max(70).optional(),
    seoDescription: z.string().max(160).optional(),
    scheduledDate: z.string().datetime().optional().nullable(),
  }),
});

export const ReviewArticleSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid article ID'),
  }),
  body: z.object({
    action: z.enum(['approve', 'reject']),
    rejectionReason: z.string().max(1000, 'Rejection reason cannot exceed 1000 characters').optional(),
  }).refine(
    (data) => {
      if (data.action === 'reject' && (!data.rejectionReason || data.rejectionReason.trim() === '')) {
        return false;
      }
      return true;
    },
    {
      message: 'Rejection reason is required when rejecting an article',
      path: ['rejectionReason'],
    }
  ),
});

export const ArticleQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().default('1'),
    limit: z.string().regex(/^\d+$/).optional().default('10'),
    status: ArticleStatusEnum.optional(),
    category: z.string().optional(),
    author: z.string().optional(),
    search: z.string().max(200).optional(),
    isFeatured: z.enum(['true', 'false']).optional(),
    isBreaking: z.enum(['true', 'false']).optional(),
    hasVideo: z.enum(['true', 'false']).optional(),
    sortBy: z.enum(['createdAt', 'publishDate', 'viewCount', 'title']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export type CreateArticleInput = z.infer<typeof CreateArticleSchema>['body'];
export type UpdateArticleInput = z.infer<typeof UpdateArticleSchema>['body'];
export type ReviewArticleInput = z.infer<typeof ReviewArticleSchema>['body'];
export type ArticleQueryInput = z.infer<typeof ArticleQuerySchema>['query'];
