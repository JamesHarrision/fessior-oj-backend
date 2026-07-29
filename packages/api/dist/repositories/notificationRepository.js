import { API_ROUTES } from '@ocj/constants';
export class NotificationRepository {
    http;
    constructor(http) {
        this.http = http;
    }
    getNotifications(query) {
        const params = query ? this.buildQueryString(query) : '';
        const path = params ? `${API_ROUTES.NOTIFICATIONS}?${params}` : API_ROUTES.NOTIFICATIONS;
        return this.http.request('GET', path);
    }
    markRead(id) {
        return this.http.request('POST', `${API_ROUTES.NOTIFICATIONS}/${id}/read`);
    }
    markAllRead() {
        return this.http.request('POST', `${API_ROUTES.NOTIFICATIONS}/read-all`);
    }
    deleteNotification(id) {
        return this.http.request('DELETE', `${API_ROUTES.NOTIFICATIONS}/${id}`);
    }
    getUnreadCount() {
        return this.http.request('GET', `${API_ROUTES.NOTIFICATIONS}/unread-count`);
    }
    buildQueryString(query) {
        const parts = [];
        for (const [key, value] of Object.entries(query)) {
            if (value !== undefined && value !== null && value !== '') {
                parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
            }
        }
        return parts.join('&');
    }
}
