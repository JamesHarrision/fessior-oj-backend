import { Request, Response } from 'express';
import { notificationService } from '../services/notification.service';

export class NotificationController {
  async createNotification(req: Request, res: Response) {
    try {
      const notification = await notificationService.createNotification(req.body);
      res.status(201).json({
        success: true,
        data: notification,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getNotifications(req: Request, res: Response) {
    try {
      const userId = req.user.userId;
      const isReadParam = req.query.isRead as string;
      const isRead = isReadParam !== undefined ? isReadParam === 'true' : undefined;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await notificationService.getNotifications(userId, isRead, page, limit);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async markAsRead(req: Request, res: Response) {
    try {
      const userId = req.user.userId;
      const { notificationIds } = req.body;
      const result = await notificationService.markAsRead(userId, notificationIds);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteNotification(req: Request, res: Response) {
    try {
      const userId = req.user.userId;
      const { notificationId } = req.params;
      await notificationService.deleteNotification(notificationId, userId);
      res.status(200).json({
        success: true,
        message: 'Notification deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

export const notificationController = new NotificationController();
