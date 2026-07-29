import { API_ROUTES } from '@ocj/constants';
export class MatchRepository {
    http;
    constructor(http) {
        this.http = http;
    }
    getMatches(query) {
        const params = query ? this.buildQueryString(query) : '';
        const path = params ? `${API_ROUTES.MATCHES}/history?${params}` : `${API_ROUTES.MATCHES}/history`;
        return this.http.request('GET', path);
    }
    getMatch(id) {
        return this.http.request('GET', `${API_ROUTES.MATCHES}/${id}`);
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
