import { API_ROUTES } from '@ocj/constants';
export class AiRepository {
    http;
    constructor(http) {
        this.http = http;
    }
    getRoadmap(data) {
        return this.http.request('POST', `${API_ROUTES.AI}/roadmap`, data);
    }
    getFeedback(submissionId) {
        return this.http.request('POST', `${API_ROUTES.AI}/feedback/${submissionId}`);
    }
    getDebug(submissionId) {
        return this.http.request('POST', `${API_ROUTES.AI}/debug/${submissionId}`);
    }
    sendChatMessage(historyId, message) {
        return this.http.request('POST', `${API_ROUTES.AI}/interview/chat/${historyId}`, { body: { message } });
    }
    getHistory() {
        return this.http.request('GET', `${API_ROUTES.AI}/history`);
    }
}
