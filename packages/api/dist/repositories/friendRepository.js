import { API_ROUTES } from '@ocj/constants';
export class FriendRepository {
    http;
    constructor(http) {
        this.http = http;
    }
    getFriends() {
        return this.http.request('GET', `${API_ROUTES.FRIENDS}`);
    }
    getFriendRequests() {
        return this.http.request('GET', `${API_ROUTES.FRIENDS}/requests`);
    }
    sendFriendRequest(userId) {
        return this.http.request('POST', `${API_ROUTES.FRIENDS}/request`, { body: { userId } });
    }
    respondFriendRequest(userId, action) {
        return this.http.request('POST', `${API_ROUTES.FRIENDS}/respond`, { body: { userId, action } });
    }
    blockUser(userId) {
        return this.http.request('POST', `${API_ROUTES.FRIENDS}/block/${userId}`);
    }
    unblockUser(userId) {
        return this.http.request('DELETE', `${API_ROUTES.FRIENDS}/block/${userId}`);
    }
}
