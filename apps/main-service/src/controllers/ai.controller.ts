import { Request, Response, NextFunction } from 'express';
import { aiService } from '../services/ai.service';

export class AIController {
  async generateRoadmap(req: Request, res: Response, next: NextFunction) {
    try {
      const roadmap = await aiService.generateRoadmap(req.body);
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
      const submissionId = req.params.submissionId as string;
      const feedback = await aiService.generateMockInterviewFeedback(submissionId);
      res.status(200).json({
        status: 'Success',
        data: feedback,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const aiController = new AIController();
