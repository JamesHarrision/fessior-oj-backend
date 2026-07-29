"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchHistoryRepository = exports.MatchHistoryRepository = void 0;
const prisma_1 = require("../config/prisma");
const client_1 = require("@prisma/client");
class MatchHistoryRepository {
    async getHistory(userId, page, limit) {
        const skip = (page - 1) * limit;
        const [total, items] = await prisma_1.prisma.$transaction([
            prisma_1.prisma.match.count({
                where: {
                    OR: [
                        { player1_id: userId },
                        { player2_id: userId },
                        { participants: { some: { user_id: userId } } }
                    ],
                },
            }),
            prisma_1.prisma.match.findMany({
                where: {
                    OR: [
                        { player1_id: userId },
                        { player2_id: userId },
                        { participants: { some: { user_id: userId } } }
                    ],
                },
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
                include: {
                    player1: {
                        select: { id: true, username: true, elo_rating: true, avatar_url: true },
                    },
                    player2: {
                        select: { id: true, username: true, elo_rating: true, avatar_url: true },
                    },
                    participants: {
                        include: {
                            user: { select: { id: true, username: true, elo_rating: true, avatar_url: true } }
                        }
                    }
                },
            }),
        ]);
        return {
            total,
            page,
            limit,
            items,
        };
    }
    async findById(matchId) {
        return prisma_1.prisma.match.findUnique({
            where: { id: matchId },
            include: {
                player1: {
                    select: { id: true, username: true, elo_rating: true, avatar_url: true },
                },
                player2: {
                    select: { id: true, username: true, elo_rating: true, avatar_url: true },
                },
                participants: {
                    include: {
                        user: { select: { id: true, username: true, elo_rating: true, avatar_url: true } }
                    }
                }
            },
        });
    }
    async findActiveMatchByUserId(userId) {
        return prisma_1.prisma.match.findFirst({
            where: {
                status: client_1.MatchStatus.PENDING,
                OR: [
                    { player1_id: userId },
                    { player2_id: userId },
                    { participants: { some: { user_id: userId } } }
                ],
            },
            include: {
                player1: {
                    select: { id: true, username: true, elo_rating: true, avatar_url: true },
                },
                player2: {
                    select: { id: true, username: true, elo_rating: true, avatar_url: true },
                },
                participants: {
                    include: {
                        user: { select: { id: true, username: true, elo_rating: true, avatar_url: true } }
                    }
                }
            },
        });
    }
    async delete(matchId) {
        return prisma_1.prisma.match.delete({
            where: { id: matchId },
        });
    }
}
exports.MatchHistoryRepository = MatchHistoryRepository;
exports.matchHistoryRepository = new MatchHistoryRepository();
