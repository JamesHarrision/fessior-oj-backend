import { Request, Response } from 'express';
export declare class ReportController {
    createReport(req: Request, res: Response): Promise<void>;
    getReports(req: Request, res: Response): Promise<void>;
    updateReportStatus(req: Request, res: Response): Promise<void>;
}
export declare const reportController: ReportController;
