"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiController = exports.AIController = void 0;
const ai_service_1 = require("../services/ai.service");
class AIController {
    async generateRoadmap(req, res, next) {
        try {
            const userId = req.user?.userId || req.body.userId; // fallback if not attached
            const roadmap = await ai_service_1.aiService.generateRoadmap(userId, req.body);
            res.status(200).json({
                status: 'Success',
                data: roadmap,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async generateMockInterviewFeedback(req, res, next) {
        try {
            const userId = req.user?.userId || req.body.userId;
            const submissionId = req.params.submissionId;
            const feedback = await ai_service_1.aiService.generateMockInterviewFeedback(userId, submissionId);
            res.status(200).json({
                status: 'Success',
                data: feedback,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async explainFailure(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({ status: 'Error', message: 'Unauthorized' });
            }
            const submissionId = req.params.submissionId;
            const explanation = await ai_service_1.aiService.explainFailure(userId, submissionId);
            res.status(200).json({
                status: 'Success',
                data: explanation,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async chatMockInterview(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({ status: 'Error', message: 'Unauthorized' });
            }
            const historyId = req.params.historyId;
            const message = req.body.message;
            const chat = await ai_service_1.aiService.chatMockInterview(userId, historyId, message);
            res.status(200).json({
                status: 'Success',
                data: chat,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getHistory(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({ status: 'Error', message: 'Unauthorized' });
            }
            const history = await ai_service_1.aiService.getHistory(userId);
            res.status(200).json({
                status: 'Success',
                data: history,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AIController = AIController;
exports.aiController = new AIController();
