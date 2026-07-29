import { API_ROUTES } from '@ocj/constants';
export class SubmissionRepository {
    http;
    constructor(http) {
        this.http = http;
    }
    submit(data) {
        return this.http.request('POST', `${API_ROUTES.SUBMISSIONS}`, { body: data });
    }
    run(data) {
        return this.http.request('POST', `${API_ROUTES.SUBMISSIONS}/run`, { body: data });
    }
    getSubmissions(query) {
        const params = query ? this.buildQueryString(query) : '';
        const path = params ? `${API_ROUTES.SUBMISSIONS}?${params}` : API_ROUTES.SUBMISSIONS;
        return this.http.request('GET', path);
    }
    getSubmission(id) {
        return this.http.request('GET', `${API_ROUTES.SUBMISSIONS}/${id}`);
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
