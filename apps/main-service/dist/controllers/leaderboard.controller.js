"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaderboardController = exports.LeaderboardController = void 0;
const leaderboard_service_1 = require("../services/leaderboard.service");
class LeaderboardController {
    async getLeaderboard(req, res, next) {
        try {
            const page = req.query.page ? parseInt(req.query.page, 10) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
            const result = await leaderboard_service_1.leaderboardService.getLeaderboard(page, limit);
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
exports.LeaderboardController = LeaderboardController;
exports.leaderboardController = new LeaderboardController();
