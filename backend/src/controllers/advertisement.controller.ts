import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Advertisement } from '../models/Advertisement';
import { createAuditLog } from '../services/audit.service';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinary.service';
import { sendSuccess, buildPaginationMeta } from '../utils/apiResponse';
import { NotFoundError, AppError } from '../utils/AppError';
import type {
  CreateAdvertisementInput,
  UpdateAdvertisementInput,
} from '../validators/advertisement.validator';

export const createAdvertisement = async (
  req: Request<any, any, CreateAdvertisementInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      throw new AppError('Advertisement image is required', 400);
    }

    const uploaded = await uploadToCloudinary(req.file.buffer, {
      folder: 'advertisements',
      resourceType: 'image',
    });

    const ad = await Advertisement.create({
      ...req.body,
      image: {
        url: uploaded.url,
        publicId: uploaded.publicId,
        alt: req.body.title,
      },
      createdBy: new mongoose.Types.ObjectId(req.user!.id),
    });

    await createAuditLog({
      action: 'AD_CREATED',
      performedBy: req.user!.id,
      targetResource: 'Advertisement',
      targetId: ad._id.toString(),
      details: { title: ad.title, slot: ad.slot },
      req,
    });

    sendSuccess(res, { advertisement: ad }, 'Advertisement created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getAdvertisements = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};

    if (req.query.slot) query.slot = req.query.slot;
    if (req.query.status) query.status = req.query.status;

    const [ads, total] = await Promise.all([
      Advertisement.find(query)
        .populate('createdBy', 'name')
        .sort({ priority: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Advertisement.countDocuments(query),
    ]);

    sendSuccess(
      res,
      { advertisements: ads },
      'Advertisements retrieved',
      200,
      buildPaginationMeta(total, page, limit)
    );
  } catch (error) {
    next(error);
  }
};

export const getActiveAdsBySlot = async (
  req: Request<{ slot: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slot } = req.params;
    const now = new Date();

    const ad = await Advertisement.findOne({
      slot,
      status: 'active',
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .sort({ priority: -1 })
      .lean();

    sendSuccess(res, { advertisement: ad });
  } catch (error) {
    next(error);
  }
};

export const updateAdvertisement = async (
  req: Request<{ id: string }, object, UpdateAdvertisementInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const ad = await Advertisement.findById(id);
    if (!ad) throw new NotFoundError('Advertisement');

    const updateData: Record<string, unknown> = { ...req.body };

    // Handle image replacement
    if (req.file) {
      // Delete old image
      await deleteFromCloudinary(ad.image.publicId);

      const uploaded = await uploadToCloudinary(req.file.buffer, {
        folder: 'advertisements',
      });

      updateData.image = {
        url: uploaded.url,
        publicId: uploaded.publicId,
        alt: req.body.title || ad.title,
      };
    }

    const updated = await Advertisement.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    await createAuditLog({
      action: 'AD_UPDATED',
      performedBy: req.user!.id,
      targetResource: 'Advertisement',
      targetId: id,
      req,
    });

    sendSuccess(res, { advertisement: updated }, 'Advertisement updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteAdvertisement = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const ad = await Advertisement.findById(id);
    if (!ad) throw new NotFoundError('Advertisement');

    await deleteFromCloudinary(ad.image.publicId);
    await Advertisement.findByIdAndDelete(id);

    await createAuditLog({
      action: 'AD_DELETED',
      performedBy: req.user!.id,
      targetResource: 'Advertisement',
      targetId: id,
      details: { title: ad.title },
      req,
    });

    sendSuccess(res, null, 'Advertisement deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const trackAdImpression = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await Advertisement.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    sendSuccess(res, null, 'Impression tracked');
  } catch (error) {
    next(error);
  }
};

export const trackAdClick = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await Advertisement.findByIdAndUpdate(req.params.id, { $inc: { clicks: 1 } });
    sendSuccess(res, null, 'Click tracked');
  } catch (error) {
    next(error);
  }
};
