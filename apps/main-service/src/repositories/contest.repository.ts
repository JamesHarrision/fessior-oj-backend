import { prisma } from '../config/prisma';

export class ContestRepository {
  async create(data: {
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    problems?: { problemId: string; points?: number; order?: number }[];
  }) {
    return prisma.contest.create({
      data: {
        title: data.title,
        description: data.description,
        start_time: data.startTime,
        end_time: data.endTime,
        problems: data.problems
          ? {
              create: data.problems.map((p) => ({
                mongo_problem_id: p.problemId,
                points: p.points ?? 100,
                order: p.order ?? 0,
              })),
            }
          : undefined,
      },
      include: {
        problems: true,
      },
    });
  }

  async update(
    contestId: string,
    data: {
      title?: string;
      description?: string;
      startTime?: Date;
      endTime?: Date;
      problems?: { problemId: string; points?: number; order?: number }[];
    }
  ) {
    return prisma.$transaction(async (tx) => {
      // 1. Update basic info
      const contest = await tx.contest.update({
        where: { id: contestId },
        data: {
          title: data.title,
          description: data.description,
          start_time: data.startTime,
          end_time: data.endTime,
        },
      });

      // 2. Update problems list if provided
      if (data.problems) {
        await tx.contestProblem.deleteMany({
          where: { contest_id: contestId },
        });

        if (data.problems.length > 0) {
          await tx.contestProblem.createMany({
            data: data.problems.map((p) => ({
              contest_id: contestId,
              mongo_problem_id: p.problemId,
              points: p.points ?? 100,
              order: p.order ?? 0,
            })),
          });
        }
      }

      return tx.contest.findUnique({
        where: { id: contestId },
        include: { problems: true },
      });
    });
  }

  async delete(contestId: string) {
    return prisma.contest.delete({
      where: { id: contestId },
    });
  }

  async findById(contestId: string) {
    return prisma.contest.findUnique({
      where: { id: contestId },
      include: {
        problems: true,
        registrations: {
          select: {
            user_id: true,
          },
        },
      },
    });
  }

  async findList(filter: 'all' | 'ongoing' | 'upcoming' | 'past') {
    const now = new Date();
    const whereClause: any = {};

    if (filter === 'ongoing') {
      whereClause.start_time = { lte: now };
      whereClause.end_time = { gte: now };
    } else if (filter === 'upcoming') {
      whereClause.start_time = { gt: now };
    } else if (filter === 'past') {
      whereClause.end_time = { lt: now };
    }

    return prisma.contest.findMany({
      where: whereClause,
      orderBy: { start_time: 'asc' },
      include: {
        _count: {
          select: { registrations: true, problems: true },
        },
        registrations: {
          select: {
            user_id: true,
          },
        },
      },
    });
  }

  async registerUser(contestId: string, userId: string) {
    return prisma.contestRegistration.create({
      data: {
        contest_id: contestId,
        user_id: userId,
      },
    });
  }

  async unregisterUser(contestId: string, userId: string) {
    return prisma.contestRegistration.delete({
      where: {
        contest_id_user_id: {
          contest_id: contestId,
          user_id: userId,
        },
      },
    });
  }

  async isRegistered(contestId: string, userId: string) {
    const reg = await prisma.contestRegistration.findUnique({
      where: {
        contest_id_user_id: {
          contest_id: contestId,
          user_id: userId,
        },
      },
    });
    return !!reg;
  }

  async findRegisteredContests(userId: string) {
    return prisma.contestRegistration.findMany({
      where: { user_id: userId },
      include: {
        contest: true,
      },
      orderBy: {
        registered_at: 'desc',
      },
    });
  }
}

export const contestRepository = new ContestRepository();
