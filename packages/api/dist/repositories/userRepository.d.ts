import type { IUser, UserUpdateProfileRequest } from '@ocj/types';
import type { ApiResponse } from '../types';
import { HttpClient } from '../httpClient';
export declare class UserRepository {
    private readonly http;
    constructor(http: HttpClient);
    getProfile(username: string): Promise<ApiResponse<IUser>>;
    updateProfile(data: UserUpdateProfileRequest): Promise<ApiResponse<IUser>>;
    getUserStats(userId: string): Promise<ApiResponse<Record<string, unknown>>>;
    getUsers(query?: Record<string, unknown>): Promise<ApiResponse<IUser[]>>;
    private buildQueryString;
}
