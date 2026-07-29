"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportController = exports.ReportController = void 0;
const report_service_1 = require("../services/report.service");
class ReportController {
    async createReport(req, res) {
        try {
            const userId = req.user.userId;
            const report = await report_service_1.reportService.createReport(userId, req.body);
            res.status(201).json({
                success: true,
                data: report,
            });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    async getReports(req, res) {
        try {
            const userId = req.user.userId;
            const userRole = req.user.role;
            const status = req.query.status;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const result = await report_service_1.reportService.getReports(userId, userRole, status, page, limit);
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    async updateReportStatus(req, res) {
        try {
            const reportId = req.params.reportId;
            const { status } = req.body;
            const updated = await report_service_1.reportService.updateReportStatus(reportId, status);
            res.status(200).json({
                success: true,
                data: updated,
            });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}
exports.ReportController = ReportController;
exports.reportController = new ReportController();
