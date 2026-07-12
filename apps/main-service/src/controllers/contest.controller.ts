import { Request, Response } from 'express';
import { contestService } from '../services/contest.service';

export class ContestController {
  async createContest(req: Request, res: Response) {
    try {
      const contest = await contestService.createContest(req.body);
      res.status(201).json({
        success: true,
        data: contest,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getContests(req: Request, res: Response) {
    try {
      const filter = (req.query.filter as any) || 'all';
      const contests = await contestService.getContests(filter);
      res.status(200).json({
        success: true,
        data: contests,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getContestDetails(req: Request, res: Response) {
    try {
      const contestId = req.params.contestId as string;
      const contest = await contestService.getContestDetails(contestId);
      res.status(200).json({
        success: true,
        data: contest,
      });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async updateContest(req: Request, res: Response) {
    try {
      const contestId = req.params.contestId as string;
      const updated = await contestService.updateContest(contestId, req.body);
      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteContest(req: Request, res: Response) {
    try {
      const contestId = req.params.contestId as string;
      await contestService.deleteContest(contestId);
      res.status(200).json({
        success: true,
        message: 'Contest deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async register(req: Request, res: Response) {
    try {
      const userId = req.user.userId;
      const contestId = req.params.contestId as string;
      const reg = await contestService.register(contestId, userId);
      res.status(200).json({
        success: true,
        data: reg,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async unregister(req: Request, res: Response) {
    try {
      const userId = req.user.userId;
      const contestId = req.params.contestId as string;
      await contestService.unregister(contestId, userId);
      res.status(200).json({
        success: true,
        message: 'Unregistered successfully',
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getContestProblems(req: Request, res: Response) {
    try {
      const userId = req.user.userId;
      const contestId = req.params.contestId as string;
      const problems = await contestService.getContestProblems(contestId, userId);
      res.status(200).json({
        success: true,
        data: problems,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getContestSubmissions(req: Request, res: Response) {
    try {
      const userId = req.user.userId;
      const userRole = req.user.role;
      const contestId = req.params.contestId as string;
      const submissions = await contestService.getContestSubmissions(contestId, userId, userRole);
      res.status(200).json({
        success: true,
        data: submissions,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getLeaderboard(req: Request, res: Response) {
    try {
      const contestId = req.params.contestId as string;
      const leaderboard = await contestService.getLeaderboard(contestId);
      res.status(200).json({
        success: true,
        data: leaderboard,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async endContest(req: Request, res: Response) {
    try {
      const contestId = req.params.contestId as string;
      const result = await contestService.endContest(contestId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getRegisteredContests(req: Request, res: Response) {
    try {
      const userId = req.user.userId;
      const contests = await contestService.getRegisteredContests(userId);
      res.status(200).json({
        success: true,
        data: contests,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

export const contestController = new ContestController();
