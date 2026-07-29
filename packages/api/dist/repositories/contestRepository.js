import { API_ROUTES } from '@ocj/constants';
export class ContestRepository {
    http;
    constructor(http) {
        this.http = http;
    }
    getContests(query) {
        const params = query ? this.buildQueryString(query) : '';
        const path = params ? `${API_ROUTES.CONTESTS}?${params}` : API_ROUTES.CONTESTS;
        return this.http.request('GET', path);
    }
    getContest(id) {
        return this.http.request('GET', `${API_ROUTES.CONTESTS}/${id}`);
    }
    createContest(data) {
        return this.http.request('POST', API_ROUTES.CONTESTS, { body: data });
    }
    updateContest(id, data) {
        return this.http.request('PUT', `${API_ROUTES.CONTESTS}/${id}`, { body: data });
    }
    deleteContest(id) {
        return this.http.request('DELETE', `${API_ROUTES.CONTESTS}/${id}`);
    }
    register(id) {
        return this.http.request('POST', `${API_ROUTES.CONTESTS}/${id}/register`);
    }
    unregister(id) {
        return this.http.request('DELETE', `${API_ROUTES.CONTESTS}/${id}/register`);
    }
    getScoreboard(id) {
        return this.http.request('GET', `${API_ROUTES.CONTESTS}/${id}/scoreboard`);
    }
    endContest(id) {
        return this.http.request('POST', `${API_ROUTES.CONTESTS}/${id}/end`);
    }
    getContestProblems(id) {
        return this.http.request('GET', `${API_ROUTES.CONTESTS}/${id}/problems`);
    }
    getContestSubmissions(id) {
        return this.http.request('GET', `${API_ROUTES.CONTESTS}/${id}/submissions`);
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
