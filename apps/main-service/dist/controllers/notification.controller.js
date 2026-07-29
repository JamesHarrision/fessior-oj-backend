"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationController = exports.NotificationController = void 0;
const notification_service_1 = require("../services/notification.service");
class NotificationController {
    async createNotification(req, res) {
        try {
            const notification = await notification_service_1.notificationService.createNotification(req.body);
            res.status(201).json({
                success: true,
                data: notification,
            });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    async getNotifications(req, res) {
        try {
            const userId = req.user.userId;
            const isReadParam = req.query.isRead;
            const isRead = isReadParam !== undefined ? isReadParam === 'true' : undefined;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const result = await notification_service_1.notificationService.getNotifications(userId, isRead, page, limit);
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    async markAsRead(req, res) {
        try {
            const userId = req.user.userId;
            const { notificationIds } = req.body;
            const result = await notification_service_1.notificationService.markAsRead(userId, notificationIds);
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    async deleteNotification(req, res) {
        try {
            const userId = req.user.userId;
            const notificationId = req.params.notificationId;
            await notification_service_1.notificationService.deleteNotification(notificationId, userId);
            res.status(200).json({
                success: true,
                message: 'Notification deleted successfully',
            });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}
exports.NotificationController = NotificationController;
exports.notificationController = new NotificationController();
