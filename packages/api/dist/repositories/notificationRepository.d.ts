import type { INotification, NotificationQuery } from '@ocj/types';
import type { ApiResponse } from '../types';
import { HttpClient } from '../httpClient';
export declare class NotificationRepository {
    private readonly http;
    constructor(http: HttpClient);
    getNotifications(query?: NotificationQuery): Promise<ApiResponse<INotification[]>>;
    markRead(id: string): Promise<ApiResponse<void>>;
    markAllRead(): Promise<ApiResponse<void>>;
    deleteNotification(id: string): Promise<ApiResponse<void>>;
    getUnreadCount(): Promise<ApiResponse<{
        count: number;
    }>>;
    private buildQueryString;
}
