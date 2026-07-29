export declare class NotificationRepository {
    create(data: {
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
    findList(userId: string, isRead?: boolean, page?: number, limit?: number): Promise<{
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
    markAsRead(userId: string, notificationIds?: string[]): Promise<import(".prisma/client").Prisma.BatchPayload>;
    findById(id: string): Promise<{
        id: string;
        created_at: Date;
        data: string | null;
        user_id: string;
        type: string;
        title: string;
        content: string;
        is_read: boolean;
    }>;
    delete(id: string, userId: string): Promise<{
        id: string;
        created_at: Date;
        data: string | null;
        user_id: string;
        type: string;
        title: string;
        content: string;
        is_read: boolean;
    }>;
}
export declare const notificationRepository: NotificationRepository;
