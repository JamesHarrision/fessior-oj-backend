import { prisma } from '../config/prisma';
import { ContestStatus } from '@prisma/client';

export const startContestCron = () => {
  console.log('Contest cron started (checking every 30s)...');
  
  setInterval(async () => {
    const now = new Date();

    try {
      // 1. UPCOMING -> ONGOING
      // If the contest has started but hasn't ended yet
      await prisma.contest.updateMany({
        where: {
          status: {
            in: [ContestStatus.UPCOMING, ContestStatus.REGISTRATION]
          },
          start_time: { lte: now },
          end_time: { gt: now }
        },
        data: { status: ContestStatus.ONGOING }
      });

      // 2. ONGOING -> ENDED
      // If the contest has passed its end time
      await prisma.contest.updateMany({
        where: {
          status: ContestStatus.ONGOING,
          end_time: { lte: now }
        },
        data: { status: ContestStatus.ENDED }
      });

      // (Optional) We could transition ENDED to RESULTS after a delay, 
      // but for now ENDED is fine, and Admin can manually set RESULTS.
    } catch (err) {
      console.error('[CRON] Contest status update error:', err);
    }
  }, 30000);
};
