"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submissionController = exports.SubmissionController = void 0;
const submission_service_1 = require("../services/submission.service");
const errors_1 = require("@ocj/errors");
class SubmissionController {
    async submit(req, res, next) {
        try {
            if (!req.user) {
                throw new errors_1.AppError('Unauthorized', 401);
            }
            const submission = await submission_service_1.submissionService.submit(req.user.userId, req.body);
            res.status(201).json({
                status: 'Success',
                data: submission,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async runCode(req, res, next) {
        try {
            if (!req.user) {
                throw new errors_1.AppError('Unauthorized', 401);
            }
            const results = await submission_service_1.submissionService.runCode(req.body);
            res.status(200).json({
                status: 'Success',
                data: results,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getSubmissionDetails(req, res, next) {
        try {
            if (!req.user) {
                throw new errors_1.AppError('Unauthorized', 401);
            }
            const submissionId = req.params.id;
            const isAdmin = req.user.role === 'ADMIN';
            const submission = await submission_service_1.submissionService.getSubmissionDetails(submissionId, req.user.userId, isAdmin);
            res.status(200).json({
                status: 'Success',
                data: submission,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getUserSubmissions(req, res, next) {
        try {
            if (!req.user) {
                throw new errors_1.AppError('Unauthorized', 401);
            }
            const problemId = req.query.problemId;
            const page = req.query.page ? parseInt(req.query.page, 10) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
            const result = await submission_service_1.submissionService.getUserSubmissions(req.user.userId, {
                problemId,
                page,
                limit,
            });
            res.status(200).json({
                status: 'Success',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.SubmissionController = SubmissionController;
exports.submissionController = new SubmissionController();
