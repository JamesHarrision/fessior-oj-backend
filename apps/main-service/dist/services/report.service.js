"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportService = exports.ReportService = void 0;
const report_repository_1 = require("../repositories/report.repository");
class ReportService {
    async createReport(userId, data) {
        return report_repository_1.reportRepository.create({
            userId,
            type: data.type,
            content: data.content,
            reportedUserId: data.reportedUserId,
            problemId: data.problemId,
        });
    }
    async getReports(userId, userRole, status, page = 1, limit = 10) {
        const filterUserId = userRole === 'ADMIN' ? undefined : userId;
        return report_repository_1.reportRepository.findList({
            userId: filterUserId,
            status,
            page,
            limit,
        });
    }
    async updateReportStatus(reportId, status) {
        const report = await report_repository_1.reportRepository.findById(reportId);
        if (!report) {
            throw new Error('Report not found');
        }
        return report_repository_1.reportRepository.updateStatus(reportId, status);
    }
}
exports.ReportService = ReportService;
exports.reportService = new ReportService();
