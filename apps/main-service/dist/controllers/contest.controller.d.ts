import { Request, Response } from 'express';
export declare class ContestController {
    createContest(req: Request, res: Response): Promise<void>;
    getContests(req: Request, res: Response): Promise<void>;
    getContestDetails(req: Request, res: Response): Promise<void>;
    updateContest(req: Request, res: Response): Promise<void>;
    deleteContest(req: Request, res: Response): Promise<void>;
    register(req: Request, res: Response): Promise<void>;
    unregister(req: Request, res: Response): Promise<void>;
    getContestProblems(req: Request, res: Response): Promise<void>;
    getContestSubmissions(req: Request, res: Response): Promise<void>;
    getLeaderboard(req: Request, res: Response): Promise<void>;
    endContest(req: Request, res: Response): Promise<void>;
}
export declare const contestController: ContestController;
