"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchHistoryController = exports.MatchHistoryController = void 0;
const match_history_service_1 = require("../services/match_history.service");
class MatchHistoryController {
    async getHistory(req, res) {
        try {
            const userId = req.user.userId;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const data = await match_history_service_1.matchHistoryService.getHistory(userId, page, limit);
            res.status(200).json({
                status: 'Success',
                message: 'Success',
                data,
            });
        }
        catch (error) {
            res.status(400).json({ status: 'Error', message: error.message });
        }
    }
    async getActiveMatch(req, res) {
        try {
            const userId = req.user.userId;
            const match = await match_history_service_1.matchHistoryService.getActiveMatch(userId);
            res.status(200).json({
                status: 'Success',
                message: 'Success',
                data: match,
            });
        }
        catch (error) {
            res.status(400).json({ status: 'Error', message: error.message });
        }
    }
    async getMatchDetails(req, res) {
        try {
            const matchId = req.params.matchId;
            const match = await match_history_service_1.matchHistoryService.getMatchDetails(matchId);
            res.status(200).json({
                status: 'Success',
                message: 'Success',
                data: match,
            });
        }
        catch (error) {
            res.status(404).json({ status: 'Error', message: error.message });
        }
    }
    async deleteMatch(req, res) {
        try {
            const matchId = req.params.matchId;
            await match_history_service_1.matchHistoryService.deleteMatch(matchId);
            res.status(200).json({
                status: 'Success',
                message: 'Match deleted successfully',
            });
        }
        catch (error) {
            res.status(400).json({ status: 'Error', message: error.message });
        }
    }
}
exports.MatchHistoryController = MatchHistoryController;
exports.matchHistoryController = new MatchHistoryController();
