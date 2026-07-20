import { Request, Response, NextFunction } from 'express';
import { Contact } from '../models/Contact';
import { sendSuccess, buildPaginationMeta } from '../utils/apiResponse';
import { NotFoundError } from '../utils/AppError';
import { sanitizeString } from '../utils/sanitize';

/**
 * Public: Submit a contact form
 */
export const submitContact = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, subject, message } = req.body;

    const contact = await Contact.create({
      name: sanitizeString(name),
      email: email.trim().toLowerCase(),
      subject: sanitizeString(subject),
      message: sanitizeString(message),
    });

    sendSuccess(res, { id: contact._id }, 'Your message has been sent successfully. We will get back to you soon!', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Get all contact submissions
 */
export const getContacts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};

    if (req.query.isRead === 'true') query.isRead = true;
    if (req.query.isRead === 'false') query.isRead = false;

    const [contacts, total] = await Promise.all([
      Contact.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Contact.countDocuments(query),
    ]);

    const pagination = buildPaginationMeta(total, page, limit);
    sendSuccess(res, { contacts }, 'Contact submissions retrieved successfully', 200, pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Mark a contact as read/unread
 */
export const toggleContactRead = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const contact = await Contact.findById(id);
    if (!contact) throw new NotFoundError('Contact submission');

    contact.isRead = !contact.isRead;
    await contact.save();

    sendSuccess(res, { contact }, `Marked as ${contact.isRead ? 'read' : 'unread'}`);
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Delete a contact submission
 */
export const deleteContact = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const contact = await Contact.findById(id);
    if (!contact) throw new NotFoundError('Contact submission');

    await Contact.findByIdAndDelete(id);
    sendSuccess(res, null, 'Contact submission deleted successfully');
  } catch (error) {
    next(error);
  }
};
