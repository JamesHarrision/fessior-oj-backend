"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contestController = exports.ContestController = void 0;
const contest_service_1 = require("../services/contest.service");
class ContestController {
    async createContest(req, res) {
        try {
            const contest = await contest_service_1.contestService.createContest(req.body);
            res.status(201).json({
                success: true,
                data: contest,
            });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    async getContests(req, res) {
        try {
            const filter = req.query.filter || 'all';
            const contests = await contest_service_1.contestService.getContests(filter);
            res.status(200).json({
                success: true,
                data: contests,
            });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    async getContestDetails(req, res) {
        try {
            const contestId = req.params.contestId;
            const contest = await contest_service_1.contestService.getContestDetails(contestId);
            res.status(200).json({
                success: true,
                data: contest,
            });
        }
        catch (error) {
            res.status(404).json({ success: false, message: error.message });
        }
    }
    async updateContest(req, res) {
        try {
            const contestId = req.params.contestId;
            const updated = await contest_service_1.contestService.updateContest(contestId, req.body);
            res.status(200).json({
                success: true,
                data: updated,
            });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    async deleteContest(req, res) {
        try {
            const contestId = req.params.contestId;
            await contest_service_1.contestService.deleteContest(contestId);
            res.status(200).json({
                success: true,
                message: 'Contest deleted successfully',
            });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    async register(req, res) {
        try {
            const userId = req.user.userId;
            const contestId = req.params.contestId;
            const reg = await contest_service_1.contestService.register(contestId, userId);
            res.status(200).json({
                success: true,
                data: reg,
            });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    async unregister(req, res) {
        try {
            const userId = req.user.userId;
            const contestId = req.params.contestId;
            await contest_service_1.contestService.unregister(contestId, userId);
            res.status(200).json({
                success: true,
                message: 'Unregistered successfully',
            });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    async getContestProblems(req, res) {
        try {
            const userId = req.user.userId;
            const contestId = req.params.contestId;
            const problems = await contest_service_1.contestService.getContestProblems(contestId, userId);
            res.status(200).json({
                success: true,
                data: problems,
            });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    async getContestSubmissions(req, res) {
        try {
            const userId = req.user.userId;
            const userRole = req.user.role;
            const contestId = req.params.contestId;
            const submissions = await contest_service_1.contestService.getContestSubmissions(contestId, userId, userRole);
            res.status(200).json({
                success: true,
                data: submissions,
            });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    async getLeaderboard(req, res) {
        try {
            const contestId = req.params.contestId;
            const leaderboard = await contest_service_1.contestService.getLeaderboard(contestId);
            res.status(200).json({
                success: true,
                data: leaderboard,
            });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    async endContest(req, res) {
        try {
            const contestId = req.params.contestId;
            const result = await contest_service_1.contestService.endContest(contestId);
            res.status(200).json(result);
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}
exports.ContestController = ContestController;
exports.contestController = new ContestController();
