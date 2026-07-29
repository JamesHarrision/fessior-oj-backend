export declare class NotificationService {
    createNotification(data: {
        userId: string;
        title: string;
        content: string;
        type: string;
        data?: string;
    }): Promise<{
        id: string;
        created_at: Date;
        data: string | null;
        user_id: string;
        type: string;
        title: string;
        content: string;
        is_read: boolean;
    }>;
    getNotifications(userId: string, isRead?: boolean, page?: number, limit?: number): Promise<{
        total: number;
        page: number;
        limit: number;
        items: {
            id: string;
            created_at: Date;
            data: string | null;
            user_id: string;
            type: string;
            title: string;
            content: string;
            is_read: boolean;
        }[];
    }>;
    markAsRead(userId: string, notificationIds?: string[]): Promise<{
        success: boolean;
    }>;
    deleteNotification(id: string, userId: string): Promise<{
        success: boolean;
    }>;
}
export declare const notificationService: NotificationService;
