"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleForfeit = exports.endMatch = exports.handleSubmissionUpdate = exports.startMatch = exports.tryMatchmaking = exports.removeUserFromQueue = exports.matchmakingQueue = void 0;
const prisma_1 = require("../config/prisma");
const problem_model_1 = require("../models/problem.model");
const client_1 = require("@prisma/client");
const socket_1 = require("./socket");
const constants_1 = require("@ocj/constants");
const utils_1 = require("@ocj/utils");
exports.matchmakingQueue = [];
const removeUserFromQueue = (userId) => {
    const index = exports.matchmakingQueue.findIndex((p) => p.userId === userId);
    if (index !== -1) {
        console.log(`Removing user from queue: ${exports.matchmakingQueue[index].username}`);
        exports.matchmakingQueue.splice(index, 1);
    }
};
exports.removeUserFromQueue = removeUserFromQueue;
const tryMatchmaking = async () => {
    if (exports.matchmakingQueue.length < 2)
        return;
    exports.matchmakingQueue.sort((a, b) => a.elo - b.elo);
    let bestDiff = Infinity;
    let matchIndex = -1;
    for (let i = 0; i < exports.matchmakingQueue.length - 1; i++) {
        const diff = Math.abs(exports.matchmakingQueue[i].elo - exports.matchmakingQueue[i + 1].elo);
        if (diff < bestDiff) {
            bestDiff = diff;
            matchIndex = i;
        }
    }
    if (matchIndex !== -1) {
        const player1 = exports.matchmakingQueue[matchIndex];
        const player2 = exports.matchmakingQueue[matchIndex + 1];
        exports.matchmakingQueue.splice(matchIndex, 2);
        await (0, exports.startMatch)(player1, player2);
    }
};
exports.tryMatchmaking = tryMatchmaking;
const startMatch = async (p1, p2) => {
    try {
        const problemsCount = await problem_model_1.Problem.countDocuments();
        if (problemsCount === 0)
            throw new Error('No problems found in database to match');
        const randomIndex = Math.floor(Math.random() * problemsCount);
        const problem = await problem_model_1.Problem.findOne().skip(randomIndex);
        if (!problem)
            throw new Error('Failed to fetch matched problem');
        const match = await prisma_1.prisma.match.create({
            data: {
                player1_id: p1.userId,
                player2_id: p2.userId,
                problem_id: problem._id.toString(),
                status: client_1.MatchStatus.PENDING,
                participants: {
                    create: [
                        { user_id: p1.userId, status: client_1.PlayerMatchStatus.CODING, score_change: 0, is_winner: false },
                        { user_id: p2.userId, status: client_1.PlayerMatchStatus.CODING, score_change: 0, is_winner: false }
                    ]
                }
            },
        });
        const p1Socket = socket_1.io?.sockets.sockets.get(p1.socketId);
        const p2Socket = socket_1.io?.sockets.sockets.get(p2.socketId);
        const roomName = `match:${match.id}`;
        p1Socket?.join(roomName);
        p2Socket?.join(roomName);
        socket_1.io?.to(roomName).emit(constants_1.SOCKET_EVENTS.MATCH_FOUND, {
            matchId: match.id,
            problem: {
                id: problem._id,
                title: problem.title,
                slug: problem.slug,
                description: problem.description,
                difficulty: problem.difficulty,
                timeLimit: problem.timeLimit,
                memoryLimit: problem.memoryLimit,
                starterCodes: problem.starterCodes,
            },
            player1: { userId: p1.userId, username: p1.username, elo: p1.elo },
            player2: { userId: p2.userId, username: p2.username, elo: p2.elo },
        });
    }
    catch (err) {
        console.error('Error starting match:', err);
        exports.matchmakingQueue.push(p1, p2);
    }
};
exports.startMatch = startMatch;
const handleSubmissionUpdate = async (data) => {
    let activeMatch;
    if (data.matchId) {
        activeMatch = await prisma_1.prisma.match.findUnique({
            where: { id: data.matchId, status: client_1.MatchStatus.PENDING },
            include: { participants: true }
        });
    }
    if (!activeMatch) {
        activeMatch = await prisma_1.prisma.match.findFirst({
            where: {
                problem_id: data.problemId,
                status: client_1.MatchStatus.PENDING,
                OR: [
                    { player1_id: data.userId },
                    { player2_id: data.userId },
                    { participants: { some: { user_id: data.userId } } }
                ],
            },
            include: { participants: true }
        });
    }
    if (!activeMatch)
        return;
    const roomName = `match:${activeMatch.id}`;
    socket_1.io?.to(roomName).emit(constants_1.SOCKET_EVENTS.RIVAL_SUBMISSION, {
        userId: data.userId,
        status: data.status,
        testCasesPassed: data.testCasesPassed,
        testCasesTotal: data.testCasesTotal,
    });
    // Update participant status if it's an arena match
    if (activeMatch.participants && activeMatch.participants.length > 0) {
        const isAC = data.status === 'ACCEPTED';
        const newStatus = isAC ? client_1.PlayerMatchStatus.ACCEPTED : client_1.PlayerMatchStatus.SUBMITTED_WA;
        await prisma_1.prisma.matchParticipant.update({
            where: { match_id_user_id: { match_id: activeMatch.id, user_id: data.userId } },
            data: { status: newStatus }
        });
    }
    if (data.status === 'ACCEPTED') {
        await (0, exports.endMatch)(activeMatch.id, data.userId);
    }
};
exports.handleSubmissionUpdate = handleSubmissionUpdate;
const endMatch = async (matchId, winnerId) => {
    await prisma_1.prisma.$transaction(async (tx) => {
        const match = await tx.match.findUnique({
            where: { id: matchId },
            include: { participants: true }
        });
        if (!match || match.status === client_1.MatchStatus.FINISHED)
            return;
        const isArenaMatch = !match.player1_id && !match.player2_id;
        let eloUpdates = {};
        if (isArenaMatch) {
            // Custom Arena Multiplayer Match (N players)
            // Winner Takes All logic: Fixed penalty for losers (e.g. -20), Winner gets sum of penalties
            const PENALTY = 20;
            const losers = match.participants.filter(p => p.user_id !== winnerId);
            const winnerReward = losers.length * PENALTY;
            for (const p of match.participants) {
                const isWinner = p.user_id === winnerId;
                const change = isWinner ? winnerReward : -PENALTY;
                // Update user elo
                const user = await tx.user.findUnique({ where: { id: p.user_id } });
                if (user) {
                    const newElo = Math.max(0, user.elo_rating + change);
                    const newStreak = isWinner ? user.streak_count + 1 : 0;
                    const maxStreak = Math.max(user.max_streak, newStreak);
                    await tx.user.update({
                        where: { id: p.user_id },
                        data: { elo_rating: newElo, streak_count: newStreak, max_streak: maxStreak }
                    });
                    eloUpdates[p.user_id] = { elo: newElo, change, streak: newStreak, username: user.username };
                }
                // Update participant
                await tx.matchParticipant.update({
                    where: { id: p.id },
                    data: {
                        is_winner: isWinner,
                        score_change: change,
                        status: isWinner ? client_1.PlayerMatchStatus.ACCEPTED : client_1.PlayerMatchStatus.SUBMITTED_WA
                    }
                });
            }
            await tx.match.update({
                where: { id: matchId },
                data: {
                    status: client_1.MatchStatus.FINISHED,
                    winner_id: winnerId,
                },
            });
        }
        else {
            // Standard 1v1 Match
            const player1Id = match.player1_id;
            const player2Id = match.player2_id;
            const loserId = winnerId === player1Id ? player2Id : player1Id;
            const winner = await tx.user.findUnique({ where: { id: winnerId } });
            const loser = await tx.user.findUnique({ where: { id: loserId } });
            if (!winner || !loser)
                return;
            const { newWinnerElo, newLoserElo, winnerChange, loserChange } = (0, utils_1.calculateEloPvP)(winner.elo_rating, loser.elo_rating);
            const newWinnerStreak = winner.streak_count + 1;
            const newWinnerMaxStreak = Math.max(winner.max_streak, newWinnerStreak);
            await tx.match.update({
                where: { id: matchId },
                data: {
                    status: client_1.MatchStatus.FINISHED,
                    winner_id: winnerId,
                    player1_status: winnerId === player1Id ? client_1.PlayerMatchStatus.ACCEPTED : client_1.PlayerMatchStatus.SUBMITTED_WA,
                    player2_status: winnerId === player2Id ? client_1.PlayerMatchStatus.ACCEPTED : client_1.PlayerMatchStatus.SUBMITTED_WA,
                },
            });
            // Update participants for 1v1
            await tx.matchParticipant.update({
                where: { match_id_user_id: { match_id: matchId, user_id: player1Id } },
                data: {
                    status: winnerId === player1Id ? client_1.PlayerMatchStatus.ACCEPTED : client_1.PlayerMatchStatus.SUBMITTED_WA,
                    score_change: winnerId === player1Id ? winnerChange : loserChange,
                    is_winner: winnerId === player1Id,
                }
            });
            await tx.matchParticipant.update({
                where: { match_id_user_id: { match_id: matchId, user_id: player2Id } },
                data: {
                    status: winnerId === player2Id ? client_1.PlayerMatchStatus.ACCEPTED : client_1.PlayerMatchStatus.SUBMITTED_WA,
                    score_change: winnerId === player2Id ? winnerChange : loserChange,
                    is_winner: winnerId === player2Id,
                }
            });
            await tx.user.update({
                where: { id: winnerId },
                data: { elo_rating: newWinnerElo, streak_count: newWinnerStreak, max_streak: newWinnerMaxStreak },
            });
            await tx.user.update({
                where: { id: loserId },
                data: { elo_rating: newLoserElo, streak_count: 0 },
            });
            eloUpdates[winnerId] = { elo: newWinnerElo, change: winnerChange, streak: newWinnerStreak };
            eloUpdates[loserId] = { elo: newLoserElo, change: loserChange, streak: 0 };
        }
        await tx.customRoom.updateMany({
            where: { match_id: matchId },
            data: { status: 'FINISHED' }
        });
        socket_1.io?.to(`match:${matchId}`).emit(constants_1.SOCKET_EVENTS.MATCH_ENDED, {
            matchId,
            winnerId,
            eloUpdates
        });
    });
};
exports.endMatch = endMatch;
const handleForfeit = async (matchId, forfeitingUserId) => {
    const match = await prisma_1.prisma.match.findUnique({
        where: { id: matchId },
        include: { participants: true }
    });
    if (!match || match.status === client_1.MatchStatus.FINISHED)
        return;
    const isArenaMatch = !match.player1_id && !match.player2_id;
    if (isArenaMatch) {
        // If it's a multiplayer arena, a forfeit from one player shouldn't end the match for everyone.
        // They just leave or get -20 immediately. But wait, if they forfeit, who is the winner?
        // We cannot easily determine a winner if someone forfeits early.
        // In multiplayer, forfeit = just mark them as SUBMITTED_WA and deduct points immediately, but don't end match.
        // For simplicity, let's just ignore forfeit in N-player mode or end it if only 1 player remains.
        const remaining = match.participants.filter(p => p.status === client_1.PlayerMatchStatus.CODING && p.user_id !== forfeitingUserId);
        if (remaining.length === 1) {
            await (0, exports.endMatch)(matchId, remaining[0].user_id);
        }
        else {
            await prisma_1.prisma.matchParticipant.update({
                where: { match_id_user_id: { match_id: matchId, user_id: forfeitingUserId } },
                data: { status: client_1.PlayerMatchStatus.SUBMITTED_WA }
            });
            socket_1.io?.to(`match:${matchId}`).emit(constants_1.SOCKET_EVENTS.RIVAL_SUBMISSION, {
                userId: forfeitingUserId,
                status: 'FORFEIT',
                testCasesPassed: 0,
                testCasesTotal: 0,
            });
        }
    }
    else {
        // Standard 1v1
        const winnerId = forfeitingUserId === match.player1_id ? match.player2_id : match.player1_id;
        await (0, exports.endMatch)(matchId, winnerId);
    }
};
exports.handleForfeit = handleForfeit;
