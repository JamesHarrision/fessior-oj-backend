import { Request, Response } from 'express';
import { matchHistoryService } from '../services/match_history.service';

export class MatchHistoryController {
  async getHistory(req: Request, res: Response) {
    try {
      const userId = req.user.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const data = await matchHistoryService.getHistory(userId, page, limit);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getMatchDetails(req: Request, res: Response) {
    try {
      const matchId = req.params.matchId as string;
      const match = await matchHistoryService.getMatchDetails(matchId);
      res.status(200).json({
        success: true,
        data: match,
      });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async deleteMatch(req: Request, res: Response) {
    try {
      const matchId = req.params.matchId as string;
      await matchHistoryService.deleteMatch(matchId);
      res.status(200).json({
        success: true,
        message: 'Match deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

export const matchHistoryController = new MatchHistoryController();
