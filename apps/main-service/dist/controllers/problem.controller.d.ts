import { Request, Response, NextFunction } from 'express';
export declare class ProblemController {
    createProblem(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateProblem(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteProblem(req: Request, res: Response, next: NextFunction): Promise<void>;
    getProblem(req: Request, res: Response, next: NextFunction): Promise<void>;
    listProblems(req: Request, res: Response, next: NextFunction): Promise<void>;
    createTag(req: Request, res: Response, next: NextFunction): Promise<void>;
    getTags(req: Request, res: Response, next: NextFunction): Promise<void>;
    addTestcase(req: Request, res: Response, next: NextFunction): Promise<void>;
    getTestcases(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteTestcase(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const problemController: ProblemController;
