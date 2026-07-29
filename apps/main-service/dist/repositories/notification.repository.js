"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationRepository = exports.NotificationRepository = void 0;
const prisma_1 = require("../config/prisma");
class NotificationRepository {
    async create(data) {
        return prisma_1.prisma.notification.create({
            data: {
                user_id: data.userId,
                title: data.title,
                content: data.content,
                type: data.type,
                data: data.data || null,
            },
        });
    }
    async findList(userId, isRead, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const whereClause = { user_id: userId };
        if (isRead !== undefined) {
            whereClause.is_read = isRead;
        }
        const [total, items] = await prisma_1.prisma.$transaction([
            prisma_1.prisma.notification.count({ where: whereClause }),
            prisma_1.prisma.notification.findMany({
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
    async markAsRead(userId, notificationIds) {
        const whereClause = { user_id: userId };
        if (notificationIds && notificationIds.length > 0) {
            whereClause.id = { in: notificationIds };
        }
        else {
            whereClause.is_read = false;
        }
        return prisma_1.prisma.notification.updateMany({
            where: whereClause,
            data: { is_read: true },
        });
    }
    async findById(id) {
        return prisma_1.prisma.notification.findUnique({
            where: { id },
        });
    }
    async delete(id, userId) {
        return prisma_1.prisma.notification.delete({
            where: {
                id,
                user_id: userId,
            },
        });
    }
}
exports.NotificationRepository = NotificationRepository;
exports.notificationRepository = new NotificationRepository();
