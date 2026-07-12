import { Request, Response, NextFunction } from 'express';
import { aiService } from '../services/ai.service';

export class AIController {
  async generateRoadmap(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id || req.body.userId; // fallback if not attached
      const roadmap = await aiService.generateRoadmap(userId, req.body);
      res.status(200).json({
        status: 'Success',
        data: roadmap,
      });
    } catch (error) {
      next(error);
    }
  }

  async generateMockInterviewFeedback(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id || req.body.userId;
      const submissionId = req.params.submissionId as string;
      const feedback = await aiService.generateMockInterviewFeedback(userId, submissionId);
      res.status(200).json({
        status: 'Success',
        data: feedback,
      });
    } catch (error) {
      next(error);
    }
  }

  async explainFailure(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ status: 'Error', message: 'Unauthorized' });
      }
      const submissionId = req.params.submissionId as string;
      const explanation = await aiService.explainFailure(userId, submissionId);
      res.status(200).json({
        status: 'Success',
        data: explanation,
      });
    } catch (error) {
      next(error);
    }
  }

  async chatMockInterview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ status: 'Error', message: 'Unauthorized' });
      }
      const historyId = req.params.historyId as string;
      const message = req.body.message as string;
      const chat = await aiService.chatMockInterview(userId, historyId, message);
      res.status(200).json({
        status: 'Success',
        data: chat,
      });
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ status: 'Error', message: 'Unauthorized' });
      }
      const history = await aiService.getHistory(userId);
      res.status(200).json({
        status: 'Success',
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const aiController = new AIController();
