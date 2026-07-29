"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchHistoryService = exports.MatchHistoryService = void 0;
const match_history_repository_1 = require("../repositories/match_history.repository");
class MatchHistoryService {
    async getHistory(userId, page = 1, limit = 10) {
        return match_history_repository_1.matchHistoryRepository.getHistory(userId, page, limit);
    }
    async getMatchDetails(matchId) {
        const match = await match_history_repository_1.matchHistoryRepository.findById(matchId);
        if (!match) {
            throw new Error('Match not found');
        }
        return match;
    }
    async getActiveMatch(userId) {
        return match_history_repository_1.matchHistoryRepository.findActiveMatchByUserId(userId);
    }
    async deleteMatch(matchId) {
        const match = await match_history_repository_1.matchHistoryRepository.findById(matchId);
        if (!match) {
            throw new Error('Match not found');
        }
        await match_history_repository_1.matchHistoryRepository.delete(matchId);
        return { success: true };
    }
}
exports.MatchHistoryService = MatchHistoryService;
exports.matchHistoryService = new MatchHistoryService();
