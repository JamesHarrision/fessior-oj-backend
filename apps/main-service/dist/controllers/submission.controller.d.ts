import { Request, Response, NextFunction } from 'express';
export declare class SubmissionController {
    submit(req: Request, res: Response, next: NextFunction): Promise<void>;
    runCode(req: Request, res: Response, next: NextFunction): Promise<void>;
    getSubmissionDetails(req: Request, res: Response, next: NextFunction): Promise<void>;
    getUserSubmissions(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const submissionController: SubmissionController;
