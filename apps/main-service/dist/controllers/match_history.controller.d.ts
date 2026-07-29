import { Request, Response } from 'express';
export declare class MatchHistoryController {
    getHistory(req: Request, res: Response): Promise<void>;
    getActiveMatch(req: Request, res: Response): Promise<void>;
    getMatchDetails(req: Request, res: Response): Promise<void>;
    deleteMatch(req: Request, res: Response): Promise<void>;
}
export declare const matchHistoryController: MatchHistoryController;
