import { API_ROUTES } from '@ocj/constants';
import type { ICustomRoom, CreateRoomRequest, JoinRoomRequest } from '@ocj/types';
import type { ApiResponse } from '../types';
import { HttpClient } from '../httpClient';

export class RoomRepository {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  getActiveRooms(): Promise<ApiResponse<ICustomRoom[]>> {
    return this.http.request('GET', `${API_ROUTES.ROOMS}/active`);
  }

  getCurrentRoom(): Promise<ApiResponse<ICustomRoom>> {
    return this.http.request('GET', `${API_ROUTES.ROOMS}/current`);
  }

  createRoom(data: CreateRoomRequest): Promise<ApiResponse<ICustomRoom>> {
    return this.http.request('POST', `${API_ROUTES.ROOMS}/create`, { body: data });
  }

  joinRoom(data: JoinRoomRequest): Promise<ApiResponse<ICustomRoom>> {
    return this.http.request('POST', `${API_ROUTES.ROOMS}/join`, { body: data });
  }

  leaveRoom(roomId: string): Promise<ApiResponse<void>> {
    return this.http.request('POST', `${API_ROUTES.ROOMS}/leave`, { body: { roomId } });
  }

  deleteRoom(roomCode: string): Promise<ApiResponse<void>> {
    return this.http.request('DELETE', `${API_ROUTES.ROOMS}/${roomCode}`);
  }
}
