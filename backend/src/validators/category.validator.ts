import { z } from 'zod';

export const CreateCategorySchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Category name is required' })
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters')
      .trim(),
    description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
    color: z
      .string()
      .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please provide a valid hex color')
      .optional()
      .default('#000000'),
    icon: z.string().max(50, 'Icon name cannot exceed 50 characters').optional(),
    parentCategory: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid parent category ID')
      .optional()
      .nullable(),
    order: z.number().int().min(0).optional(),
  }),
});

export const UpdateCategorySchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID'),
  }),
  body: z.object({
    name: z.string().min(2).max(100).trim().optional(),
    description: z.string().max(500).optional(),
    color: z
      .string()
      .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please provide a valid hex color')
      .optional(),
    icon: z.string().max(50).optional(),
    parentCategory: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid parent category ID')
      .optional()
      .nullable(),
    order: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const ReorderCategoriesSchema = z.object({
  body: z.object({
    categories: z.array(
      z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID'),
        order: z.number().int().min(0),
      })
    ).min(1, 'At least one category is required'),
  }),
});

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>['body'];
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>['body'];
export type ReorderCategoriesInput = z.infer<typeof ReorderCategoriesSchema>['body'];
