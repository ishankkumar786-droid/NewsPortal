import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ValidationError } from '../utils/AppError';

/**
 * Middleware factory to validate request using a Zod schema.
 * Validates body, params, and query automatically.
 */
export const validate = (schema: AnyZodObject) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      // Replace req fields with sanitized/validated values
      if (parsed.body) req.body = parsed.body as unknown;
      if (parsed.params) req.params = parsed.params as Record<string, string>;
      if (parsed.query) req.query = parsed.query as Record<string, string>;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {};

        error.errors.forEach((err) => {
          const field = err.path.slice(1).join('.') || 'general'; // Remove leading 'body'/'query'/'params'
          if (!errors[field]) {
            errors[field] = [];
          }
          errors[field].push(err.message);
        });

        next(new ValidationError('Validation failed', errors));
      } else {
        next(error);
      }
    }
  };
};
