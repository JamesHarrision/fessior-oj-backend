import { Request, Response } from 'express';
export declare class NotificationController {
    createNotification(req: Request, res: Response): Promise<void>;
    getNotifications(req: Request, res: Response): Promise<void>;
    markAsRead(req: Request, res: Response): Promise<void>;
    deleteNotification(req: Request, res: Response): Promise<void>;
}
export declare const notificationController: NotificationController;
