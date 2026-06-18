import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { User } from '../models/User';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  setTokenCookies,
  clearTokenCookies,
} from '../services/token.service';
import { sendPasswordResetEmail, sendWelcomeEmail } from '../services/email.service';
import { createAuditLog } from '../services/audit.service';
import { sendSuccess } from '../utils/apiResponse';
import { UnauthorizedError, NotFoundError, ConflictError, AppError } from '../utils/AppError';
import { invalidateUserCache } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';
import type {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
  UpdateProfileInput,
} from '../validators/auth.validator';

export const register = async (
  req: Request<any, any, RegisterInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    // Check for existing user
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ConflictError('An account with this email already exists');
    }

    // Prevent creating super_admin via API. Zod should restrict this to reporter|visitor
    const user = await User.create({ name, email, password, role });

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user.email, user.name).catch(() => {});

    await createAuditLog({
      action: 'USER_REGISTER',
      performedBy: user._id.toString(),
      details: { email: user.email, role: user.role },
      req,
    });

    const accessToken = generateAccessToken(user._id.toString(), user.role);
    const refreshToken = generateRefreshToken(user._id.toString(), user.role);

    // Store refresh token
    user.refreshTokens = [refreshToken];
    await user.save({ validateBeforeSave: false });

    setTokenCookies(res, accessToken, refreshToken);

    sendSuccess(
      res,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
        accessToken,
      },
      'Account created successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request<any, any, LoginInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Fetch user with password
    const user = await User.findByEmail(email);

    if (!user) {
      // Use same error for both non-existent user and wrong password (prevent enumeration)
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check if account is locked
    if (user.isAccountLocked()) {
      throw new AppError('Account temporarily locked due to too many failed attempts. Try again in 2 hours.', 423);
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Your account has been deactivated. Contact support.');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await user.incrementLoginAttempts();
      throw new UnauthorizedError('Invalid email or password');
    }

    // Reset failed attempts on successful login
    await user.resetLoginAttempts();

    const accessToken = generateAccessToken(user._id.toString(), user.role);
    const refreshToken = generateRefreshToken(user._id.toString(), user.role);

    // Rotate refresh tokens — keep last 5
    const tokens = user.refreshTokens || [];
    tokens.push(refreshToken);
    if (tokens.length > 5) tokens.splice(0, tokens.length - 5);
    user.refreshTokens = tokens;
    await user.save({ validateBeforeSave: false });

    setTokenCookies(res, accessToken, refreshToken);

    await createAuditLog({
      action: 'USER_LOGIN',
      performedBy: user._id.toString(),
      details: { email: user.email },
      req,
    });

    sendSuccess(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      accessToken,
    }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refreshToken as string | undefined;

    if (refreshToken && req.user) {
      // Invalidate the refresh token
      await User.findByIdAndUpdate(req.user.id, {
        $pull: { refreshTokens: refreshToken },
      });
    }

    clearTokenCookies(res);

    if (req.user) {
      await createAuditLog({
        action: 'USER_LOGOUT',
        performedBy: req.user.id,
        req,
      });
    }

    sendSuccess(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies?.refreshToken as string | undefined;

    if (!token) {
      throw new UnauthorizedError('Refresh token is required');
    }

    const decoded = verifyRefreshToken(token);

    if (decoded.type !== 'refresh') {
      throw new UnauthorizedError('Invalid token type');
    }

    // Verify token exists in DB (rotation check)
    const user = await User.findById(decoded.userId)
      .select('+refreshTokens');

    if (!user || !user.isActive) {
      throw new UnauthorizedError('User not found or deactivated');
    }

    if (!user.refreshTokens.includes(token)) {
      // Token reuse detected — invalidate all tokens
      user.refreshTokens = [];
      await user.save({ validateBeforeSave: false });
      logger.warn(`Refresh token reuse detected for user: ${user._id}`);
      throw new UnauthorizedError('Invalid refresh token. Please login again.');
    }

    // Issue new tokens (rotation)
    const newAccessToken = generateAccessToken(user._id.toString(), user.role);
    const newRefreshToken = generateRefreshToken(user._id.toString(), user.role);

    // Replace old token with new one
    user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
    user.refreshTokens.push(newRefreshToken);
    await user.save({ validateBeforeSave: false });

    setTokenCookies(res, newAccessToken, newRefreshToken);

    sendSuccess(res, { accessToken: newAccessToken }, 'Token refreshed successfully');
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  req: Request<any, any, ForgotPasswordInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success to prevent email enumeration
    if (!user) {
      sendSuccess(
        res,
        null,
        'If an account with that email exists, a password reset link has been sent.'
      );
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Send email BEFORE saving — if sendEmail fails (throws), the token is never committed
    await sendPasswordResetEmail(user.email, resetToken, user.name);

    await user.save({ validateBeforeSave: false });

    await createAuditLog({
      action: 'USER_PASSWORD_RESET',
      performedBy: user._id.toString(),
      details: { email: user.email },
      req,
    });

    sendSuccess(
      res,
      null,
      'If an account with that email exists, a password reset link has been sent.'
    );
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request<{ token: string }, object, ResetPasswordInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Hash the token to compare with DB
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      throw new AppError('Password reset token is invalid or has expired', 400);
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    // Invalidate all refresh tokens
    user.refreshTokens = [];
    await user.save();

    clearTokenCookies(res);

    await createAuditLog({
      action: 'USER_PASSWORD_RESET',
      performedBy: user._id.toString(),
      req,
    });

    sendSuccess(res, null, 'Password reset successfully. Please login with your new password.');
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
  req: Request<any, any, ChangePasswordInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId).select('+password +refreshTokens');
    if (!user) throw new NotFoundError('User');

    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    user.password = newPassword;
    user.refreshTokens = [];
    await user.save();

    invalidateUserCache(userId);
    clearTokenCookies(res);

    await createAuditLog({
      action: 'USER_PASSWORD_CHANGE',
      performedBy: userId,
      req,
    });

    sendSuccess(res, null, 'Password changed successfully. Please login again.');
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) throw new NotFoundError('User');

    sendSuccess(res, { user });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: Request<any, any, UpdateProfileInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, bio } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user!.id,
      { $set: { name, bio } },
      { new: true, runValidators: true }
    );

    if (!user) throw new NotFoundError('User');

    invalidateUserCache(req.user!.id);

    await createAuditLog({
      action: 'USER_UPDATED',
      performedBy: req.user!.id,
      targetResource: 'User',
      targetId: req.user!.id,
      req,
    });

    sendSuccess(res, { user }, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};
