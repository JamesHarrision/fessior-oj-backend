import { API_ROUTES } from '@ocj/constants';
export class ReportRepository {
    http;
    constructor(http) {
        this.http = http;
    }
    getReports(query) {
        const params = query ? this.buildQueryString(query) : '';
        const path = params ? `${API_ROUTES.REPORTS}?${params}` : API_ROUTES.REPORTS;
        return this.http.request('GET', path);
    }
    getMyReports() {
        return this.http.request('GET', `${API_ROUTES.REPORTS}/my`);
    }
    createReport(data) {
        return this.http.request('POST', API_ROUTES.REPORTS, { body: data });
    }
    updateReportStatus(id, status) {
        return this.http.request('PATCH', `${API_ROUTES.REPORTS}/${id}/status`, { body: { status } });
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
