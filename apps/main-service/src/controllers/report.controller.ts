import { Request, Response } from 'express';
import { reportService } from '../services/report.service';

export class ReportController {
  async createReport(req: Request, res: Response) {
    try {
      const userId = req.user.userId;
      const report = await reportService.createReport(userId, req.body);
      res.status(201).json({
        success: true,
        data: report,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getReports(req: Request, res: Response) {
    try {
      const userId = req.user.userId;
      const userRole = req.user.role;
      const status = req.query.status as any;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await reportService.getReports(userId, userRole, status, page, limit);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateReportStatus(req: Request, res: Response) {
    try {
      const reportId = req.params.reportId as string;
      const { status } = req.body;
      const updated = await reportService.updateReportStatus(reportId as string, status);
      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

export const reportController = new ReportController();
