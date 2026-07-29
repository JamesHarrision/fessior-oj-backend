import { API_ROUTES } from '@ocj/constants';
export class RoomRepository {
    http;
    constructor(http) {
        this.http = http;
    }
    getActiveRooms() {
        return this.http.request('GET', `${API_ROUTES.ROOMS}/active`);
    }
    getCurrentRoom() {
        return this.http.request('GET', `${API_ROUTES.ROOMS}/current`);
    }
    createRoom(data) {
        return this.http.request('POST', `${API_ROUTES.ROOMS}/create`, { body: data });
    }
    joinRoom(data) {
        return this.http.request('POST', `${API_ROUTES.ROOMS}/join`, { body: data });
    }
    leaveRoom(roomId) {
        return this.http.request('POST', `${API_ROUTES.ROOMS}/leave`, { body: { roomId } });
    }
    deleteRoom(roomCode) {
        return this.http.request('DELETE', `${API_ROUTES.ROOMS}/${roomCode}`);
    }
}
