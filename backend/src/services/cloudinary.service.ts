import { cloudinary } from '../config/cloudinary';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';
import { UploadApiResponse } from 'cloudinary';

export type MediaFolder = 'articles' | 'avatars' | 'advertisements' | 'gallery';

interface UploadOptions {
  folder: MediaFolder;
  transformation?: Record<string, unknown>[];
  resourceType?: 'image' | 'video' | 'auto';
}

interface UploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format: string;
  size: number;
  duration?: number;
}

export const uploadToCloudinary = async (
  buffer: Buffer,
  options: UploadOptions
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: `news-portal/${options.folder}`,
      resource_type: (options.resourceType || 'auto') as 'image' | 'video' | 'auto' | 'raw',
      transformation: options.transformation,
      use_filename: false,
      unique_filename: true,
      overwrite: false,
      // Image quality optimization
      quality: 'auto:good',
      fetch_format: 'auto',
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result: UploadApiResponse | undefined) => {
        if (error) {
          logger.error('Cloudinary upload error:', error);
          reject(new AppError('Failed to upload file to cloud storage', 500));
          return;
        }

        if (!result) {
          reject(new AppError('Upload failed: no result returned', 500));
          return;
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          size: result.bytes,
          duration: result.duration,
        });
      }
    );

    uploadStream.end(buffer);
  });
};

export const deleteFromCloudinary = async (
  publicId: string,
  resourceType: 'image' | 'video' = 'image'
): Promise<void> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    if (result.result !== 'ok' && result.result !== 'not found') {
      throw new AppError(`Failed to delete file: ${result.result}`, 500);
    }

    logger.info(`Deleted from Cloudinary: ${publicId}`);
  } catch (error) {
    logger.error('Cloudinary delete error:', error);
    throw error;
  }
};

export const generateThumbnailUrl = (
  publicId: string,
  width = 400,
  height = 225
): string => {
  return cloudinary.url(publicId, {
    width,
    height,
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto:good',
    fetch_format: 'auto',
    secure: true,
  });
};
