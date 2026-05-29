import { prisma } from '../config/prisma';
import { ReportStatus } from '@prisma/client';

export class ReportRepository {
  async create(data: {
    userId: string;
    type: string;
    content: string;
    reportedUserId?: string;
    problemId?: string;
  }) {
    return prisma.report.create({
      data: {
        user_id: data.userId,
        type: data.type,
        content: data.content,
        reported_user_id: data.reportedUserId || null,
        problem_id: data.problemId || null,
        status: ReportStatus.PENDING,
      },
    });
  }

  async findList(filter: { userId?: string; status?: ReportStatus; page: number; limit: number }) {
    const skip = (filter.page - 1) * filter.limit;
    const whereClause: any = {};

    if (filter.userId) {
      whereClause.user_id = filter.userId;
    }

    if (filter.status) {
      whereClause.status = filter.status;
    }

    const [total, items] = await prisma.$transaction([
      prisma.report.count({ where: whereClause }),
      prisma.report.findMany({
        where: whereClause,
        skip,
        take: filter.limit,
        orderBy: { created_at: 'desc' },
      }),
    ]);

    return {
      total,
      page: filter.page,
      limit: filter.limit,
      items,
    };
  }

  async findById(id: string) {
    return prisma.report.findUnique({
      where: { id },
    });
  }

  async updateStatus(id: string, status: ReportStatus) {
    return prisma.report.update({
      where: { id },
      data: {
        status,
      },
    });
  }
}

export const reportRepository = new ReportRepository();
