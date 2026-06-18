import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

// Allowed MIME types
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
];

const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

// Max file sizes
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

// Use memory storage — files processed before Cloudinary upload
const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        `File type ${file.mimetype} is not allowed. Allowed types: JPEG, PNG, WEBP, GIF, MP4, WebM`,
        400
      )
    );
  }
};

export const uploadImage = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      cb(new AppError(`Only image files are allowed (JPEG, PNG, WEBP, GIF)`, 400));
      return;
    }
    cb(null, true);
  },
  limits: {
    fileSize: MAX_IMAGE_SIZE,
    files: 1,
  },
});

export const uploadMultipleImages = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      cb(new AppError(`Only image files are allowed`, 400));
      return;
    }
    cb(null, true);
  },
  limits: {
    fileSize: MAX_IMAGE_SIZE,
    files: 10, // Max 10 images at once
  },
});

export const uploadVideo = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
      cb(new AppError(`Only video files are allowed (MP4, WebM, OGG, MOV)`, 400));
      return;
    }
    cb(null, true);
  },
  limits: {
    fileSize: MAX_VIDEO_SIZE,
    files: 1,
  },
});

export const uploadAny = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_VIDEO_SIZE,
    files: 1,
  },
});

// Handle multer errors
export const handleUploadError = (
  err: Error,
  _req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      next(new AppError('File size exceeds the maximum allowed limit', 400));
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      next(new AppError('Too many files uploaded at once', 400));
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      next(new AppError('Unexpected file field', 400));
    } else {
      next(new AppError(`Upload error: ${err.message}`, 400));
    }
  } else {
    next(err);
  }
};
