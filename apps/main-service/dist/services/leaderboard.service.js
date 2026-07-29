"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaderboardService = exports.LeaderboardService = void 0;
const prisma_1 = require("../config/prisma");
class LeaderboardService {
    async getLeaderboard(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [total, items] = await prisma_1.prisma.$transaction([
            prisma_1.prisma.user.count(),
            prisma_1.prisma.user.findMany({
                skip,
                take: limit,
                orderBy: { elo_rating: 'desc' },
                select: {
                    id: true,
                    username: true,
                    elo_rating: true,
                    streak_count: true,
                    max_streak: true,
                    created_at: true,
                },
            }),
        ]);
        return {
            total,
            page,
            limit,
            items: items.map((user) => ({
                id: user.id,
                username: user.username,
                elo: user.elo_rating,
                streak: user.streak_count,
                highest_streak: user.max_streak,
                created_at: user.created_at,
            })),
        };
    }
}
exports.LeaderboardService = LeaderboardService;
exports.leaderboardService = new LeaderboardService();
