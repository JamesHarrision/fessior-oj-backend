import { API_ROUTES } from '@ocj/constants';
export class ProblemRepository {
    http;
    constructor(http) {
        this.http = http;
    }
    getProblems(query) {
        const params = query ? this.buildQueryString(query) : '';
        const path = params ? `${API_ROUTES.PROBLEMS}?${params}` : API_ROUTES.PROBLEMS;
        return this.http.request('GET', path);
    }
    getProblem(slug) {
        return this.http.request('GET', `${API_ROUTES.PROBLEMS}/${slug}`);
    }
    createProblem(data) {
        return this.http.request('POST', API_ROUTES.PROBLEMS, { body: data });
    }
    updateProblem(id, data) {
        return this.http.request('PUT', `${API_ROUTES.PROBLEMS}/${id}`, { body: data });
    }
    deleteProblem(id) {
        return this.http.request('DELETE', `${API_ROUTES.PROBLEMS}/${id}`);
    }
    getTags() {
        return this.http.request('GET', `${API_ROUTES.PROBLEMS}/tags`);
    }
    getTestcases(problemId, isExample) {
        const query = isExample !== undefined ? `?example=${isExample}` : '';
        return this.http.request('GET', `${API_ROUTES.PROBLEMS}/${problemId}/testcases${query}`);
    }
    createTestcase(problemId, data) {
        return this.http.request('POST', `${API_ROUTES.PROBLEMS}/${problemId}/testcases`, { body: data });
    }
    deleteTestcase(problemId, testcaseId) {
        return this.http.request('DELETE', `${API_ROUTES.PROBLEMS}/${problemId}/testcases/${testcaseId}`);
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
