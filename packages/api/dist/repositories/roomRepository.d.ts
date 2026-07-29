import type { ICustomRoom, CreateRoomRequest, JoinRoomRequest } from '@ocj/types';
import type { ApiResponse } from '../types';
import { HttpClient } from '../httpClient';
export declare class RoomRepository {
    private readonly http;
    constructor(http: HttpClient);
    getActiveRooms(): Promise<ApiResponse<ICustomRoom[]>>;
    getCurrentRoom(): Promise<ApiResponse<ICustomRoom>>;
    createRoom(data: CreateRoomRequest): Promise<ApiResponse<ICustomRoom>>;
    joinRoom(data: JoinRoomRequest): Promise<ApiResponse<ICustomRoom>>;
    leaveRoom(roomId: string): Promise<ApiResponse<void>>;
    deleteRoom(roomCode: string): Promise<ApiResponse<void>>;
}
