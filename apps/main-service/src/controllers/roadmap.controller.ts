import { Request, Response, NextFunction } from 'express';
import { roadmapService } from '../services/roadmap.service';
import { GenerateRoadmapRequest, UpdateRoadmapSessionRequest } from '@ocj/types';

export class RoadmapController {
  async generateRoadmap(req: Request, res: Response, next: NextFunction) {
    try {
      const { prompt, startDate } = req.body as GenerateRoadmapRequest;
      const userId = (req.user as any).userId;
      const roadmap = await roadmapService.generateRoadmap(userId, prompt, startDate);
      res.status(201).json({ status: "Success", data: roadmap });
    } catch (error) {
      next(error);
    }
  }

  async getUserRoadmaps(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req.user as any).userId;
      const roadmaps = await roadmapService.getUserRoadmaps(userId);
      res.status(200).json({ status: "Success", data: roadmaps });
    } catch (error) {
      next(error);
    }
  }

  async getRoadmapDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const userId = (req.user as any).userId;
      const roadmap = await roadmapService.getRoadmapDetail(id, userId);
      res.status(200).json({ status: "Success", data: roadmap });
    } catch (error) {
      next(error);
    }
  }

  async updateSession(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string; // session id
      const userId = (req.user as any).userId;
      const updateData = req.body as UpdateRoadmapSessionRequest;
      
      const session = await roadmapService.updateRoadmapSession(id, userId, updateData);
      res.status(200).json({ status: "Success", data: session });
    } catch (error) {
      next(error);
    }
  }

  async toggleShare(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string; // roadmap id
      const userId = (req.user as any).userId;
      const { is_shared } = req.body;
      
      const roadmap = await roadmapService.toggleRoadmapShare(id, userId, is_shared);
      res.status(200).json({ status: "Success", data: roadmap });
    } catch (error) {
      next(error);
    }
  }

  async deleteRoadmap(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const userId = (req.user as any).userId;
      
      await roadmapService.deleteRoadmap(id, userId);
      res.status(200).json({ status: "Success", message: "Roadmap deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}

export const roadmapController = new RoadmapController();
