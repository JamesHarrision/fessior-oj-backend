import { notificationRepository } from '../repositories/notification.repository';
import { io } from '../sockets/socket';
import { SOCKET_EVENTS } from '@ocj/constants';

export class NotificationService {
  async createNotification(data: {
    userId: string;
    title: string;
    content: string;
    type: string;
    data?: string;
  }) {
    const notification = await notificationRepository.create(data);

    // Emit real-time notification via Socket.IO
    if (io) {
      io.to(`user:${data.userId}`).emit(SOCKET_EVENTS.NOTIFICATION, notification);
    }

    return notification;
  }

  async getNotifications(userId: string, isRead?: boolean, page = 1, limit = 10) {
    return notificationRepository.findList(userId, isRead, page, limit);
  }

  async markAsRead(userId: string, notificationIds?: string[]) {
    await notificationRepository.markAsRead(userId, notificationIds);
    return { success: true };
  }

  async deleteNotification(id: string, userId: string) {
    const notification = await notificationRepository.findById(id);
    if (!notification || notification.user_id !== userId) {
      throw new Error('Notification not found');
    }

    await notificationRepository.delete(id, userId);
    return { success: true };
  }
}

export const notificationService = new NotificationService();
