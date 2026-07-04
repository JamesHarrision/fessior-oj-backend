import { API_ROUTES } from '@ocj/constants';
import type { INotification, NotificationQuery } from '@ocj/types';
import type { ApiResponse } from '../types';
import { HttpClient } from '../httpClient';

export class NotificationRepository {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  getNotifications(query?: NotificationQuery): Promise<ApiResponse<INotification[]>> {
    const params = query ? this.buildQueryString(query) : '';
    const path = params ? `${API_ROUTES.NOTIFICATIONS}?${params}` : API_ROUTES.NOTIFICATIONS;
    return this.http.request('GET', path);
  }

  markRead(id: string): Promise<ApiResponse<void>> {
    return this.http.request('POST', `${API_ROUTES.NOTIFICATIONS}/${id}/read`);
  }

  markAllRead(): Promise<ApiResponse<void>> {
    return this.http.request('POST', `${API_ROUTES.NOTIFICATIONS}/read-all`);
  }

  deleteNotification(id: string): Promise<ApiResponse<void>> {
    return this.http.request('DELETE', `${API_ROUTES.NOTIFICATIONS}/${id}`);
  }

  getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    return this.http.request('GET', `${API_ROUTES.NOTIFICATIONS}/unread-count`);
  }

  private buildQueryString(query: Record<string, unknown>): string {
    const parts: string[] = [];
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
      }
    }
    return parts.join('&');
  }
}
