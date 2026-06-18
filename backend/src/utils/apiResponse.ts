import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200,
  pagination?: PaginationMeta,
  cacheTTLs?: { public?: number; private?: number }
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };

  if (pagination) {
    response.pagination = pagination;
  }

  // Set Cache-Control header for GET requests
  if (res.req?.method === 'GET') {
    if (cacheTTLs) {
      const directives: string[] = [];
      if (cacheTTLs.public !== undefined) {
        directives.push('public', `s-maxage=${cacheTTLs.public}`, `max-age=${Math.min(cacheTTLs.public, 60)}`);
      } else if (cacheTTLs.private !== undefined) {
        directives.push('private', `s-maxage=${cacheTTLs.private}`, `max-age=${Math.min(cacheTTLs.private, 60)}`);
      }
      if (directives.length > 0) {
        res.set('Cache-Control', directives.join(', '));
      }
    }
  }

  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  errors?: Record<string, string[]>
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
  };

  // Never expose internal error details in production
  if (process.env.NODE_ENV !== 'production' && errors) {
    response.errors = errors;
  } else if (process.env.NODE_ENV === 'production') {
    // Sanitize error messages in production
    response.message = statusCode >= 500 ? 'Internal server error' : message;
  }

  return res.status(statusCode).json(response);
};

export const buildPaginationMeta = (
  total: number,
  page: number,
  limit: number
): PaginationMeta => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
  hasNextPage: page < Math.ceil(total / limit),
  hasPrevPage: page > 1,
});
