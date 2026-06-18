import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

interface ErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  stack?: string;
}

export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal server error';
  let errors: Record<string, string[]> | undefined;

  // Operational errors (expected)
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;

    if (statusCode < 500) {
      logger.warn(`[${req.method}] ${req.path} - ${statusCode}: ${message}`);
      require('fs').appendFileSync('error-log.txt', `[${req.method}] ${req.path} >> StatusCode:: ${statusCode}, Message:: ${message}\n`);
    } else {
      logger.error(`[${req.method}] ${req.path} - ${statusCode}: ${message}`, {
        stack: err.stack,
      });
      require('fs').appendFileSync('error-log.txt', `[${req.method}] ${req.path} >> StatusCode:: ${statusCode}, Message:: ${message}, Error:: ${err.stack}\n`);
    }
  }

  // MongoDB duplicate key error
  else if ((err as { code?: number }).code === 11000) {
    const keyError = err as { keyPattern?: Record<string, number> };
    const field = keyError.keyPattern ? Object.keys(keyError.keyPattern)[0] : 'field';
    statusCode = 409;
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    errors = { [field]: [`This ${field} is already in use`] };
    logger.warn(`Duplicate key error on field: ${field}`);
  }

  // MongoDB CastError (invalid ObjectId)
  else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
    errors = { [err.path]: [`Invalid value provided`] };
  }

  // MongoDB ValidationError
  else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = 'Validation failed';
    errors = {};
    Object.keys(err.errors).forEach((key) => {
      errors![key] = [err.errors[key].message];
    });
  }

  // JWT errors handled in auth middleware, but as fallback:
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Unknown server errors
  else {
    logger.error('Unexpected error:', {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  }

  const response: ErrorResponse = {
    success: false,
    message: process.env.NODE_ENV === 'production' && statusCode >= 500 ? 'Internal server error' : message,
  };

  // Only include errors in non-production OR for client errors
  if (errors && (process.env.NODE_ENV !== 'production' || statusCode < 500)) {
    response.errors = errors;
  }

  // Include stack in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

// Handle 404 - must be placed after all routes
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
};
