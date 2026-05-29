import { contestRepository } from '../repositories/contest.repository';
import { Problem } from '../models/problem.model';
import { Submission } from '../models/submission.model';
import { prisma } from '../config/prisma';

export class ContestService {
  async createContest(data: {
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    problems?: { problemId: string; points?: number; order?: number }[];
  }) {
    return contestRepository.create({
      title: data.title,
      description: data.description,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      problems: data.problems,
    });
  }

  async getContests(filter: 'all' | 'ongoing' | 'upcoming' | 'past' = 'all') {
    return contestRepository.findList(filter);
  }

  async getContestDetails(contestId: string) {
    const contest = await contestRepository.findById(contestId);
    if (!contest) {
      throw new Error('Contest not found');
    }
    return contest;
  }

  async updateContest(
    contestId: string,
    data: {
      title?: string;
      description?: string;
      startTime?: string;
      endTime?: string;
      problems?: { problemId: string; points?: number; order?: number }[];
    }
  ) {
    const contest = await contestRepository.findById(contestId);
    if (!contest) {
      throw new Error('Contest not found');
    }

    return contestRepository.update(contestId, {
      title: data.title,
      description: data.description,
      startTime: data.startTime ? new Date(data.startTime) : undefined,
      endTime: data.endTime ? new Date(data.endTime) : undefined,
      problems: data.problems,
    });
  }

  async deleteContest(contestId: string) {
    const contest = await contestRepository.findById(contestId);
    if (!contest) {
      throw new Error('Contest not found');
    }
    await contestRepository.delete(contestId);
    return { success: true };
  }

  async register(contestId: string, userId: string) {
    const contest = await contestRepository.findById(contestId);
    if (!contest) {
      throw new Error('Contest not found');
    }

    if (new Date() > new Date(contest.end_time)) {
      throw new Error('Contest has already ended');
    }

    const alreadyReg = await contestRepository.isRegistered(contestId, userId);
    if (alreadyReg) {
      throw new Error('Already registered for this contest');
    }

    return contestRepository.registerUser(contestId, userId);
  }

  async unregister(contestId: string, userId: string) {
    const contest = await contestRepository.findById(contestId);
    if (!contest) {
      throw new Error('Contest not found');
    }

    if (new Date() > new Date(contest.start_time)) {
      throw new Error('Cannot unregister after contest has started');
    }

    const alreadyReg = await contestRepository.isRegistered(contestId, userId);
    if (!alreadyReg) {
      throw new Error('Not registered for this contest');
    }

    return contestRepository.unregisterUser(contestId, userId);
  }

  async getContestProblems(contestId: string, userId: string) {
    const contest = await contestRepository.findById(contestId);
    if (!contest) {
      throw new Error('Contest not found');
    }

    const now = new Date();
    if (now < new Date(contest.start_time)) {
      throw new Error('Contest has not started yet');
    }

    const isReg = await contestRepository.isRegistered(contestId, userId);
    if (!isReg) {
      throw new Error('You must register for this contest to view problems');
    }

    const mongoIds = contest.problems.map((p) => p.mongo_problem_id);
    const problems = await Problem.find({ _id: { $in: mongoIds } });

    // Format problems with points and order
    const formatted = contest.problems
      .map((cp) => {
        const pDoc = problems.find((p) => p._id.toString() === cp.mongo_problem_id);
        if (!pDoc) return null;
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

  async getContestSubmissions(contestId: string, userId: string, requestUserRole: string) {
    const contest = await contestRepository.findById(contestId);
    if (!contest) {
      throw new Error('Contest not found');
    }

    const now = new Date();
    const isReg = await contestRepository.isRegistered(contestId, userId);
    if (requestUserRole !== 'ADMIN' && !isReg) {
      throw new Error('You must be registered to view contest submissions');
    }

    const query: any = { contestId };
    
    // If user is not admin and contest is still active, they can only see their own submissions
    const isContestRunning = now >= new Date(contest.start_time) && now <= new Date(contest.end_time);
    if (requestUserRole !== 'ADMIN' && isContestRunning) {
      query.userId = userId;
    }

    return Submission.find(query).sort({ createdAt: -1 });
  }

  async getLeaderboard(contestId: string) {
    const contest = await contestRepository.findById(contestId);
    if (!contest) {
      throw new Error('Contest not found');
    }

    // 1. Fetch all registered users
    const registeredUserIds = contest.registrations.map((r) => r.user_id);
    if (registeredUserIds.length === 0) {
      return [];
    }

    const users = await prisma.user.findMany({
      where: { id: { in: registeredUserIds } },
      select: { id: true, username: true, elo_rating: true, avatar_url: true },
    });

    // 2. Fetch all accepted submissions for this contest
    const submissions = await Submission.find({
      contestId,
      status: 'ACCEPTED',
    }).sort({ createdAt: 1 }); // Sort chronologically to get earliest solves

    // 3. Map contest problems points
    const problemPointsMap: { [mongoId: string]: number } = {};
    contest.problems.forEach((p) => {
      problemPointsMap[p.mongo_problem_id] = p.points;
    });

    // 4. Calculate standings
    const standings = users.map((user) => {
      const userSubs = submissions.filter((s) => s.userId === user.id);
      
      // Keep track of first accepted submission per problem to sum points and compute penalty/time
      const solvedProblems = new Set<string>();
      let totalPoints = 0;
      let totalTime = 0; // sum of milliseconds from contest start to submission time

      userSubs.forEach((sub) => {
        const pIdStr = sub.problemId.toString();
        if (!solvedProblems.has(pIdStr) && problemPointsMap[pIdStr] !== undefined) {
          solvedProblems.add(pIdStr);
          totalPoints += problemPointsMap[pIdStr];
          
          const timeSpent = Math.max(0, sub.createdAt.getTime() - new Date(contest.start_time).getTime());
          totalTime += timeSpent;
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
}

export const contestService = new ContestService();
