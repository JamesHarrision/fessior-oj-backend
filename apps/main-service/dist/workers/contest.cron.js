"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startContestCron = void 0;
const prisma_1 = require("../config/prisma");
const client_1 = require("@prisma/client");
const startContestCron = () => {
    console.log('Contest cron started (checking every 30s)...');
    setInterval(async () => {
        const now = new Date();
        try {
            // 1. UPCOMING -> ONGOING
            // If the contest has started but hasn't ended yet
            await prisma_1.prisma.contest.updateMany({
                where: {
                    status: {
                        in: [client_1.ContestStatus.UPCOMING, client_1.ContestStatus.REGISTRATION]
                    },
                    start_time: { lte: now },
                    end_time: { gt: now }
                },
                data: { status: client_1.ContestStatus.ONGOING }
            });
            // 2. ONGOING -> ENDED
            // If the contest has passed its end time
            await prisma_1.prisma.contest.updateMany({
                where: {
                    status: client_1.ContestStatus.ONGOING,
                    end_time: { lte: now }
                },
                data: { status: client_1.ContestStatus.ENDED }
            });
            // (Optional) We could transition ENDED to RESULTS after a delay, 
            // but for now ENDED is fine, and Admin can manually set RESULTS.
        }
        catch (err) {
            console.error('[CRON] Contest status update error:', err);
        }
    }, 30000);
};
exports.startContestCron = startContestCron;
