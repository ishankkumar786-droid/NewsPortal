import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { UserRole } from '../models/User';
import { JwtPayload } from '../middleware/auth.middleware';

const ACCESS_TOKEN_EXPIRES = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

export const generateAccessToken = (userId: string, role: UserRole): string => {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error('JWT_ACCESS_SECRET is not configured');

  return jwt.sign({ userId, role, type: 'access' }, secret, {
    expiresIn: ACCESS_TOKEN_EXPIRES,
  } as jwt.SignOptions);
};

export const generateRefreshToken = (userId: string, role: UserRole): string => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error('JWT_REFRESH_SECRET is not configured');

  return jwt.sign({ userId, role, type: 'refresh' }, secret, {
    expiresIn: REFRESH_TOKEN_EXPIRES,
  } as jwt.SignOptions);
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error('JWT_REFRESH_SECRET is not configured');

  return jwt.verify(token, secret) as JwtPayload;
};

export const setTokenCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
): void => {
  // Access token — short-lived
  res.cookie('accessToken', accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  // Refresh token — long-lived
  res.cookie('refreshToken', refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const clearTokenCookies = (res: Response): void => {
  res.cookie('accessToken', '', {
    ...COOKIE_OPTIONS,
    maxAge: 0,
  });
  res.cookie('refreshToken', '', {
    ...COOKIE_OPTIONS,
    maxAge: 0,
  });
};
