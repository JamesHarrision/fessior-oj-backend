import { API_ROUTES } from '@ocj/constants';
export class CommentRepository {
    http;
    constructor(http) {
        this.http = http;
    }
    getComments(targetId, targetType) {
        return this.http.request('GET', `${API_ROUTES.COMMENTS}?targetId=${encodeURIComponent(targetId)}&targetType=${encodeURIComponent(targetType)}`);
    }
    createComment(data) {
        return this.http.request('POST', API_ROUTES.COMMENTS, { body: data });
    }
    updateComment(id, data) {
        return this.http.request('PUT', `${API_ROUTES.COMMENTS}/${id}`, { body: data });
    }
    deleteComment(id) {
        return this.http.request('DELETE', `${API_ROUTES.COMMENTS}/${id}`);
    }
    likeComment(id) {
        return this.http.request('POST', `${API_ROUTES.COMMENTS}/${id}/like`);
    }
    unlikeComment(id) {
        return this.http.request('DELETE', `${API_ROUTES.COMMENTS}/${id}/like`);
    }
}
