import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../models/User';
import { UnauthorizedError, ForbiddenError } from '../utils/AppError';
import { logger } from '../utils/logger';

export interface JwtPayload {
  userId: string;
  role: UserRole;
  type: 'access' | 'refresh';
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
        name: string;
        email: string;
      };
    }
  }
}

// In-memory user cache — avoids a DB hit on every authenticated request
const userCache = new Map<string, {
  data: { id: string; role: UserRole; name: string; email: string; isActive: boolean; passwordChangedAt?: Date };
  expiresAt: number;
}>();
const USER_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCachedUser = async (userId: string) => {
  const cached = userCache.get(userId);
  if (cached && cached.expiresAt > Date.now()) return cached.data;

  const user = await User.findById(userId).select('name email role isActive passwordChangedAt');
  if (!user) return null;

  const data = {
    id: user._id.toString(),
    role: user.role,
    name: user.name,
    email: user.email,
    isActive: user.isActive,
    passwordChangedAt: user.passwordChangedAt,
  };
  userCache.set(userId, { data, expiresAt: Date.now() + USER_CACHE_TTL });
  return data;
};

export const invalidateUserCache = (userId: string) => userCache.delete(userId);

/**
 * Authenticate JWT access token
 * Reads token from Authorization header OR httpOnly cookie
 */
export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Check Authorization header first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // Fall back to httpOnly cookie
    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken as string;
    }

    if (!token) {
      throw new UnauthorizedError('Access token is required');
    }

    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET is not configured');
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;

    if (decoded.type !== 'access') {
      throw new UnauthorizedError('Invalid token type');
    }

    // Verify user still exists and is active (cached)
    const user = await getCachedUser(decoded.userId);

    if (!user || !user.isActive) {
      throw new UnauthorizedError('User account not found or deactivated');
    }

    // Check if password was changed after token was issued
    if (user.passwordChangedAt) {
      const tokenIssuedAt = decoded.iat * 1000;
      if (user.passwordChangedAt.getTime() > tokenIssuedAt) {
        throw new UnauthorizedError('Password was recently changed. Please login again');
      }
    }

    req.user = {
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Access token has expired'));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid access token'));
    } else {
      next(error);
    }
  }
};

/**
 * Authorize based on roles
 */
export const authorize = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError());
      return;
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(`Unauthorized access attempt by user ${req.user.id} with role ${req.user.role}`);
      next(new ForbiddenError());
      return;
    }

    next();
  };
};

/**
 * Optional authentication — doesn't throw if no token
 */
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken as string;
    }

    if (!token) {
      return next();
    }

    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) return next();

    const decoded = jwt.verify(token, secret) as JwtPayload;
    const user = await getCachedUser(decoded.userId);

    if (user && user.isActive) {
      req.user = {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
      };
    }
  } catch {
    // Silently ignore auth errors for optional auth
  }

  next();
};
