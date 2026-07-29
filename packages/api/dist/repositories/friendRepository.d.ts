import type { IFriendship } from '@ocj/types';
import type { ApiResponse } from '../types';
import { HttpClient } from '../httpClient';
export declare class FriendRepository {
    private readonly http;
    constructor(http: HttpClient);
    getFriends(): Promise<ApiResponse<IFriendship[]>>;
    getFriendRequests(): Promise<ApiResponse<IFriendship[]>>;
    sendFriendRequest(userId: string): Promise<ApiResponse<void>>;
    respondFriendRequest(userId: string, action: 'accept' | 'reject'): Promise<ApiResponse<void>>;
    blockUser(userId: string): Promise<ApiResponse<void>>;
    unblockUser(userId: string): Promise<ApiResponse<void>>;
}
