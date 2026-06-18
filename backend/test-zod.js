const { z } = require('zod');

const ArticleStatusEnum = z.enum([
  'draft',
  'submitted',
  'pending_review',
  'approved',
  'published',
  'rejected',
  'scheduled',
]);

const ArticleQuerySchema = z.object({
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

const req = {
  query: {
    status: 'draft',
    page: '1',
    limit: '15',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    _t: '1718721112345'
  }
};

try {
  const parsed = ArticleQuerySchema.parse(req);
  console.log('Parsed query:', parsed.query);
} catch (e) {
  console.error(e);
}
