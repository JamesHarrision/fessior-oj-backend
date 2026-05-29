import { prisma } from '../config/prisma';

export class NotificationRepository {
  async create(data: {
    userId: string;
    title: string;
    content: string;
    type: string;
    data?: string;
  }) {
    return prisma.notification.create({
      data: {
        user_id: data.userId,
        title: data.title,
        content: data.content,
        type: data.type,
        data: data.data || null,
      },
    });
  }

  async findList(userId: string, isRead?: boolean, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const whereClause: any = { user_id: userId };

    if (isRead !== undefined) {
      whereClause.is_read = isRead;
    }

    const [total, items] = await prisma.$transaction([
      prisma.notification.count({ where: whereClause }),
      prisma.notification.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
    ]);

    return {
      total,
      page,
      limit,
      items,
    };
  }

  async markAsRead(userId: string, notificationIds?: string[]) {
    const whereClause: any = { user_id: userId };

    if (notificationIds && notificationIds.length > 0) {
      whereClause.id = { in: notificationIds };
    } else {
      whereClause.is_read = false;
    }

    return prisma.notification.updateMany({
      where: whereClause,
      data: { is_read: true },
    });
  }

  async findById(id: string) {
    return prisma.notification.findUnique({
      where: { id },
    });
  }

  async delete(id: string, userId: string) {
    return prisma.notification.delete({
      where: {
        id,
        user_id: userId,
      },
    });
  }
}

export const notificationRepository = new NotificationRepository();
