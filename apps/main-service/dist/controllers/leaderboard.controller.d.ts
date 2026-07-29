import { Request, Response, NextFunction } from 'express';
export declare class LeaderboardController {
    getLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const leaderboardController: LeaderboardController;
