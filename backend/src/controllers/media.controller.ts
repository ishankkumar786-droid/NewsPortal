import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Media } from '../models/Media';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinary.service';
import { createAuditLog } from '../services/audit.service';
import { sendSuccess, buildPaginationMeta } from '../utils/apiResponse';
import { NotFoundError, ForbiddenError, AppError } from '../utils/AppError';

export const uploadMedia = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      throw new AppError('No file provided', 400);
    }

    const file = req.file;
    const isVideo = file.mimetype.startsWith('video/');
    const folder = isVideo ? 'articles' : 'articles';

    const uploaded = await uploadToCloudinary(file.buffer, {
      folder,
      resourceType: isVideo ? 'video' : 'image',
    });

    const media = await Media.create({
      url: uploaded.url,
      publicId: uploaded.publicId,
      type: isVideo ? 'video' : 'image',
      filename: uploaded.publicId.split('/').pop() || file.originalname,
      originalName: file.originalname,
      size: uploaded.size,
      width: uploaded.width,
      height: uploaded.height,
      duration: uploaded.duration,
      format: uploaded.format,
      uploadedBy: new mongoose.Types.ObjectId(req.user!.id),
      folder,
      alt: req.body.alt || '',
      caption: req.body.caption || '',
    });

    await createAuditLog({
      action: 'MEDIA_UPLOADED',
      performedBy: req.user!.id,
      targetResource: 'Media',
      targetId: media._id.toString(),
      details: { type: media.type, originalName: media.originalName },
      req,
    });

    sendSuccess(res, { media }, 'File uploaded successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getMedia = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};

    if (req.query.type) query.type = req.query.type;
    if (req.query.folder) query.folder = req.query.folder;

    // Reporters see only their uploads
    if (req.user?.role === 'reporter') {
      query.uploadedBy = new mongoose.Types.ObjectId(req.user.id);
    }

    const [media, total] = await Promise.all([
      Media.find(query)
        .populate('uploadedBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Media.countDocuments(query),
    ]);

    sendSuccess(res, { media }, 'Media retrieved', 200, buildPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const deleteMedia = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const media = await Media.findById(id);
    if (!media) throw new NotFoundError('Media');

    // Reporters can only delete their own uploads
    if (req.user?.role === 'reporter' && media.uploadedBy.toString() !== req.user.id) {
      throw new ForbiddenError('You can only delete your own uploads');
    }

    await deleteFromCloudinary(media.publicId, media.type as 'image' | 'video');
    await Media.findByIdAndDelete(id);

    await createAuditLog({
      action: 'MEDIA_DELETED',
      performedBy: req.user!.id,
      targetResource: 'Media',
      targetId: id,
      details: { originalName: media.originalName },
      req,
    });

    sendSuccess(res, null, 'Media deleted successfully');
  } catch (error) {
    next(error);
  }
};
