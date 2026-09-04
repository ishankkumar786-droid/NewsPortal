import { Request, Response, NextFunction } from 'express';
import { Comment } from '../models/Comment';
import { Article } from '../models/Article';
import { sendSuccess } from '../utils/apiResponse';
import { NotFoundError, ForbiddenError, AppError } from '../utils/AppError';

export const getArticleComments = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const comments = await Comment.find({ article: id, isApproved: true })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    sendSuccess(res, { comments }, 'Comments retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const addComment = async (
  req: Request<{ id: string }, object, { content: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user!.id;

    if (!content || content.trim().length === 0) {
      throw new AppError('Comment content is required', 400);
    }

    const article = await Article.findById(id);
    if (!article) throw new NotFoundError('Article');
    if (article.status !== 'published') {
      throw new AppError('Can only comment on published articles', 400);
    }

    const comment = await Comment.create({
      article: id,
      user: userId,
      content: content.trim(),
    });

    const populatedComment = await comment.populate('user', 'name avatar');

    sendSuccess(res, { comment: populatedComment }, 'Comment added successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (
  req: Request<{ commentId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { commentId } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const comment = await Comment.findById(commentId);
    if (!comment) throw new NotFoundError('Comment');

    // Users can delete their own comments. Admins can delete any comment.
    if (userRole !== 'super_admin' && comment.user.toString() !== userId) {
      throw new ForbiddenError('You are not authorized to delete this comment');
    }

    await Comment.findByIdAndDelete(commentId);

    sendSuccess(res, null, 'Comment deleted successfully');
  } catch (error) {
    next(error);
  }
};
