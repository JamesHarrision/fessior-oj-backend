"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = exports.NotificationService = void 0;
const notification_repository_1 = require("../repositories/notification.repository");
const socket_1 = require("../sockets/socket");
const constants_1 = require("@ocj/constants");
class NotificationService {
    async createNotification(data) {
        const notification = await notification_repository_1.notificationRepository.create(data);
        // Emit real-time notification via Socket.IO
        if (socket_1.io) {
            socket_1.io.to(`user:${data.userId}`).emit(constants_1.SOCKET_EVENTS.NOTIFICATION, notification);
        }
        return notification;
    }
    async getNotifications(userId, isRead, page = 1, limit = 10) {
        return notification_repository_1.notificationRepository.findList(userId, isRead, page, limit);
    }
    async markAsRead(userId, notificationIds) {
        await notification_repository_1.notificationRepository.markAsRead(userId, notificationIds);
        return { success: true };
    }
    async deleteNotification(id, userId) {
        const notification = await notification_repository_1.notificationRepository.findById(id);
        if (!notification || notification.user_id !== userId) {
            throw new Error('Notification not found');
        }
        await notification_repository_1.notificationRepository.delete(id, userId);
        return { success: true };
    }
}
exports.NotificationService = NotificationService;
exports.notificationService = new NotificationService();
