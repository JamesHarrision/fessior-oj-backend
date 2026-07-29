import { API_ROUTES } from '@ocj/constants';
export class AuthRepository {
    http;
    constructor(http) {
        this.http = http;
    }
    login(payload) {
        return this.http.request('POST', `${API_ROUTES.AUTH}/login`, { body: payload });
    }
    register(payload) {
        return this.http.request('POST', `${API_ROUTES.AUTH}/register`, { body: payload });
    }
    me() {
        return this.http.request('GET', `${API_ROUTES.AUTH}/me`);
    }
    logout(payload) {
        return this.http.request('POST', `${API_ROUTES.AUTH}/logout`, { body: payload });
    }
}
