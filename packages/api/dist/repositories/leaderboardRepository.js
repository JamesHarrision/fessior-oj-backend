import { API_ROUTES } from '@ocj/constants';
export class LeaderboardRepository {
    http;
    constructor(http) {
        this.http = http;
    }
    getLeaderboard(query) {
        const params = query ? this.buildQueryString(query) : '';
        const path = params ? `${API_ROUTES.LEADERBOARD}?${params}` : API_ROUTES.LEADERBOARD;
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
