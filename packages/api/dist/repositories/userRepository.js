import { API_ROUTES } from '@ocj/constants';
export class UserRepository {
    http;
    constructor(http) {
        this.http = http;
    }
    getProfile(username) {
        return this.http.request('GET', `${API_ROUTES.USER}/profile/${username}`);
    }
    updateProfile(data) {
        return this.http.request('PUT', `${API_ROUTES.USER}/profile`, { body: data });
    }
    getUserStats(userId) {
        return this.http.request('GET', `${API_ROUTES.USER}/${userId}/stats`);
    }
    getUsers(query) {
        const params = query ? this.buildQueryString(query) : '';
        const path = params ? `${API_ROUTES.USER}?${params}` : API_ROUTES.USER;
        return this.http.request('GET', path);
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
