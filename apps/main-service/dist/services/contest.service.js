"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contestService = exports.ContestService = void 0;
const contest_repository_1 = require("../repositories/contest.repository");
const problem_model_1 = require("../models/problem.model");
const submission_model_1 = require("../models/submission.model");
const prisma_1 = require("../config/prisma");
class ContestService {
    async createContest(data) {
        return contest_repository_1.contestRepository.create({
            title: data.title,
            description: data.description,
            startTime: new Date(data.startTime),
            endTime: new Date(data.endTime),
            problems: data.problems,
        });
    }
    async getContests(filter = 'all') {
        return contest_repository_1.contestRepository.findList(filter);
    }
    async getContestDetails(contestId) {
        const contest = await contest_repository_1.contestRepository.findById(contestId);
        if (!contest) {
            throw new Error('Contest not found');
        }
        return contest;
    }
    async updateContest(contestId, data) {
        const contest = await contest_repository_1.contestRepository.findById(contestId);
        if (!contest) {
            throw new Error('Contest not found');
        }
        return contest_repository_1.contestRepository.update(contestId, {
            title: data.title,
            description: data.description,
            startTime: data.startTime ? new Date(data.startTime) : undefined,
            endTime: data.endTime ? new Date(data.endTime) : undefined,
            problems: data.problems,
        });
    }
    async deleteContest(contestId) {
        const contest = await contest_repository_1.contestRepository.findById(contestId);
        if (!contest) {
            throw new Error('Contest not found');
        }
        await contest_repository_1.contestRepository.delete(contestId);
        return { success: true };
    }
    async register(contestId, userId) {
        const contest = await contest_repository_1.contestRepository.findById(contestId);
        if (!contest) {
            throw new Error('Contest not found');
        }
        if (new Date() > new Date(contest.end_time)) {
            throw new Error('Contest has already ended');
        }
        const alreadyReg = await contest_repository_1.contestRepository.isRegistered(contestId, userId);
        if (alreadyReg) {
            throw new Error('Already registered for this contest');
        }
        return contest_repository_1.contestRepository.registerUser(contestId, userId);
    }
    async unregister(contestId, userId) {
        const contest = await contest_repository_1.contestRepository.findById(contestId);
        if (!contest) {
            throw new Error('Contest not found');
        }
        if (new Date() > new Date(contest.start_time)) {
            throw new Error('Cannot unregister after contest has started');
        }
        const alreadyReg = await contest_repository_1.contestRepository.isRegistered(contestId, userId);
        if (!alreadyReg) {
            throw new Error('Not registered for this contest');
        }
        return contest_repository_1.contestRepository.unregisterUser(contestId, userId);
    }
    async getContestProblems(contestId, userId) {
        const contest = await contest_repository_1.contestRepository.findById(contestId);
        if (!contest) {
            throw new Error('Contest not found');
        }
        const now = new Date();
        if (now < new Date(contest.start_time)) {
            throw new Error('Contest has not started yet');
        }
        const isReg = await contest_repository_1.contestRepository.isRegistered(contestId, userId);
        if (!isReg) {
            throw new Error('You must register for this contest to view problems');
        }
        const mongoIds = contest.problems.map((p) => p.mongo_problem_id);
        const problems = await problem_model_1.Problem.find({ _id: { $in: mongoIds } });
        // Format problems with points and order
        const formatted = contest.problems
            .map((cp) => {
            const pDoc = problems.find((p) => p._id.toString() === cp.mongo_problem_id);
            if (!pDoc)
                return null;
            return {
                id: pDoc._id,
                title: pDoc.title,
                slug: pDoc.slug,
                difficulty: pDoc.difficulty,
                points: cp.points,
                order: cp.order,
            };
        })
            .filter(Boolean);
        return formatted;
    }
    async getContestSubmissions(contestId, userId, requestUserRole) {
        const contest = await contest_repository_1.contestRepository.findById(contestId);
        if (!contest) {
            throw new Error('Contest not found');
        }
        const now = new Date();
        const isReg = await contest_repository_1.contestRepository.isRegistered(contestId, userId);
        if (requestUserRole !== 'ADMIN' && !isReg) {
            throw new Error('You must be registered to view contest submissions');
        }
        const query = { contestId };
        // If user is not admin and contest is still active, they can only see their own submissions
        const isContestRunning = now >= new Date(contest.start_time) && now <= new Date(contest.end_time);
        if (requestUserRole !== 'ADMIN' && isContestRunning) {
            query.userId = userId;
        }
        return submission_model_1.Submission.find(query).sort({ createdAt: -1 });
    }
    async getLeaderboard(contestId) {
        const contest = await contest_repository_1.contestRepository.findById(contestId);
        if (!contest) {
            throw new Error('Contest not found');
        }
        // 1. Fetch all registered users
        const registeredUserIds = contest.registrations.map((r) => r.user_id);
        if (registeredUserIds.length === 0) {
            return [];
        }
        const users = await prisma_1.prisma.user.findMany({
            where: { id: { in: registeredUserIds } },
            select: { id: true, username: true, elo_rating: true, avatar_url: true },
        });
        // 2. Fetch all submissions for this contest to calculate penalty and scores
        const submissions = await submission_model_1.Submission.find({
            contestId,
        }).sort({ createdAt: 1 }); // Sort chronologically to get earliest solves
        // 3. Map contest problems points
        const problemPointsMap = {};
        contest.problems.forEach((p) => {
            problemPointsMap[p.mongo_problem_id] = p.points;
        });
        // 4. Calculate standings
        const standings = users.map((user) => {
            const userSubs = submissions.filter((s) => s.userId === user.id);
            // Keep track of first accepted submission per problem to sum points and compute penalty/time
            const solvedProblems = new Set();
            const wrongAttempts = new Map();
            let totalPoints = 0;
            let totalTime = 0; // sum of milliseconds from contest start to submission time
            userSubs.forEach((sub) => {
                const pIdStr = sub.problemId.toString();
                if (solvedProblems.has(pIdStr) || problemPointsMap[pIdStr] === undefined) {
                    return; // Already solved or invalid problem
                }
                if (sub.status === 'ACCEPTED') {
                    solvedProblems.add(pIdStr);
                    totalPoints += problemPointsMap[pIdStr];
                    const timeSpent = Math.max(0, sub.createdAt.getTime() - new Date(contest.start_time).getTime());
                    const penaltyMs = (wrongAttempts.get(pIdStr) || 0) * 20 * 60 * 1000; // 20 mins per WA
                    totalTime += (timeSpent + penaltyMs);
                }
                else {
                    // It's a WA/TLE/etc before AC
                    wrongAttempts.set(pIdStr, (wrongAttempts.get(pIdStr) || 0) + 1);
                }
            });
            return {
                userId: user.id,
                username: user.username,
                elo: user.elo_rating,
                avatarUrl: user.avatar_url,
                score: totalPoints,
                timePenalty: Math.floor(totalTime / 1000), // in seconds
                solvedCount: solvedProblems.size,
            };
        });
        // Sort by score desc, then by timePenalty asc
        standings.sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            return a.timePenalty - b.timePenalty;
        });
        return standings;
    }
    async endContest(contestId) {
        const contest = await contest_repository_1.contestRepository.findById(contestId);
        if (!contest)
            throw new Error('Contest not found');
        const standings = await this.getLeaderboard(contestId);
        const N = standings.length;
        if (N > 0) {
            await prisma_1.prisma.$transaction(async (tx) => {
                // Find or create badges
                const top1Badge = await tx.badge.upsert({
                    where: { slug: 'contest-top-1' },
                    update: {},
                    create: { name: 'Top 1 Contest', slug: 'contest-top-1', type: 'ACHIEVEMENT', description: 'Đạt hạng 1 trong một Contest' }
                });
                const top2Badge = await tx.badge.upsert({
                    where: { slug: 'contest-top-2' },
                    update: {},
                    create: { name: 'Top 2 Contest', slug: 'contest-top-2', type: 'ACHIEVEMENT', description: 'Đạt hạng 2 trong một Contest' }
                });
                const top3Badge = await tx.badge.upsert({
                    where: { slug: 'contest-top-3' },
                    update: {},
                    create: { name: 'Top 3 Contest', slug: 'contest-top-3', type: 'ACHIEVEMENT', description: 'Đạt hạng 3 trong một Contest' }
                });
                const participantBadge = await tx.badge.upsert({
                    where: { slug: 'contest-participant' },
                    update: {},
                    create: { name: 'Contest Participant', slug: 'contest-participant', type: 'CONTEST', description: 'Tham gia thi đấu Contest' }
                });
                for (let i = 0; i < N; i++) {
                    const userEntry = standings[i];
                    const rank = i;
                    let eloChange = Math.round(((N - 1) / 2 - rank) * 10);
                    let oldElo = userEntry.elo;
                    let newElo = oldElo + eloChange;
                    await tx.eloHistory.create({
                        data: {
                            user: { connect: { id: userEntry.userId } },
                            old_elo: oldElo,
                            new_elo: newElo,
                            change: eloChange,
                            reason: 'CONTEST',
                        },
                    });
                    await tx.user.update({
                        where: { id: userEntry.userId },
                        data: { elo_rating: { increment: eloChange } }
                    });
                    const awardBadge = async (badgeId) => {
                        const existing = await tx.userBadge.findUnique({
                            where: { user_id_badge_id: { user_id: userEntry.userId, badge_id: badgeId } }
                        });
                        if (!existing) {
                            await tx.userBadge.create({ data: { user_id: userEntry.userId, badge_id: badgeId } });
                        }
                    };
                    await awardBadge(participantBadge.id);
                    if (rank === 0)
                        await awardBadge(top1Badge.id);
                    if (rank === 1)
                        await awardBadge(top2Badge.id);
                    if (rank === 2)
                        await awardBadge(top3Badge.id);
                }
            });
        }
        await prisma_1.prisma.contest.update({
            where: { id: contestId },
            data: { status: 'RESULTS' }
        });
        return { success: true, message: 'Contest ended successfully' };
    }
}
exports.ContestService = ContestService;
exports.contestService = new ContestService();
