import { z } from 'zod';

const AdSlotEnum = z.enum([
  'HOME_TOP',
  'HOME_MIDDLE',
  'HOME_BOTTOM',
  'ARTICLE_TOP',
  'ARTICLE_MIDDLE',
  'ARTICLE_BOTTOM',
  'SIDEBAR_TOP',
  'SIDEBAR_BOTTOM',
]);

export const CreateAdvertisementSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: 'Title is required' })
      .min(2, 'Title must be at least 2 characters')
      .max(200, 'Title cannot exceed 200 characters')
      .trim(),
    targetUrl: z
      .string({ required_error: 'Target URL is required' })
      .url('Please provide a valid URL'),
    slot: AdSlotEnum,
    priority: z.number().int().min(1).max(10).optional().default(1),
    startDate: z.string({ required_error: 'Start date is required' }).datetime(),
    endDate: z.string({ required_error: 'End date is required' }).datetime(),
  }).refine(
    (data) => new Date(data.endDate) > new Date(data.startDate),
    {
      message: 'End date must be after start date',
      path: ['endDate'],
    }
  ),
});

export const UpdateAdvertisementSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid advertisement ID'),
  }),
  body: z.object({
    title: z.string().min(2).max(200).trim().optional(),
    targetUrl: z.string().url('Please provide a valid URL').optional(),
    slot: AdSlotEnum.optional(),
    priority: z.number().int().min(1).max(10).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    status: z.enum(['active', 'inactive', 'scheduled', 'expired']).optional(),
  }),
});

export type CreateAdvertisementInput = z.infer<typeof CreateAdvertisementSchema>['body'];
export type UpdateAdvertisementInput = z.infer<typeof UpdateAdvertisementSchema>['body'];
