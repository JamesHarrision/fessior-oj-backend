import { Request, Response, NextFunction } from 'express';
export declare class AIController {
    generateRoadmap(req: Request, res: Response, next: NextFunction): Promise<void>;
    generateMockInterviewFeedback(req: Request, res: Response, next: NextFunction): Promise<void>;
    explainFailure(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    chatMockInterview(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    getHistory(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
}
export declare const aiController: AIController;
