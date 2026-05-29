import { reportRepository } from '../repositories/report.repository';
import { ReportStatus } from '@prisma/client';

export class ReportService {
  async createReport(
    userId: string,
    data: {
      type: string;
      content: string;
      reportedUserId?: string;
      problemId?: string;
    }
  ) {
    return reportRepository.create({
      userId,
      type: data.type,
      content: data.content,
      reportedUserId: data.reportedUserId,
      problemId: data.problemId,
    });
  }

  async getReports(
    userId: string,
    userRole: string,
    status?: ReportStatus,
    page = 1,
    limit = 10
  ) {
    const filterUserId = userRole === 'ADMIN' ? undefined : userId;
    return reportRepository.findList({
      userId: filterUserId,
      status,
      page,
      limit,
    });
  }

  async updateReportStatus(reportId: string, status: ReportStatus) {
    const report = await reportRepository.findById(reportId);
    if (!report) {
      throw new Error('Report not found');
    }

    return reportRepository.updateStatus(reportId, status);
  }
}

export const reportService = new ReportService();
