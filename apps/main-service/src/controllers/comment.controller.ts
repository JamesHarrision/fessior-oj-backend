import { Request, Response } from 'express';
import { commentService } from '../services/comment.service';

export class CommentController {
  async createComment(req: Request, res: Response) {
    try {
      const userId = req.user.userId;
      const comment = await commentService.createComment(userId, req.body);
      res.status(201).json({
        success: true,
        data: comment,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getComments(req: Request, res: Response) {
    try {
      const targetId = req.query.targetId as string;
      const targetType = req.query.targetType as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!targetId || !targetType) {
        throw new Error('targetId and targetType are required');
      }

      const comments = await commentService.getComments(targetId, targetType, page, limit);
      res.status(200).json({
        success: true,
        data: comments,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateComment(req: Request, res: Response) {
    try {
      const userId = req.user.userId;
      const commentId = req.params.commentId as string;
      const { content } = req.body;
      const updated = await commentService.updateComment(commentId, userId, content);
      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteComment(req: Request, res: Response) {
    try {
      const userId = req.user.userId;
      const userRole = req.user.role;
      const commentId = req.params.commentId as string;
      await commentService.deleteComment(commentId, userId, userRole);
      res.status(200).json({
        success: true,
        message: 'Comment deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async toggleLike(req: Request, res: Response) {
    try {
      const userId = req.user.userId;
      const commentId = req.params.commentId as string;
      const result = await commentService.toggleLike(commentId, userId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

export const commentController = new CommentController();
