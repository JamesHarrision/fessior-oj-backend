export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type ApiStatus = 'Success' | 'Error';
export interface ApiResponse<TData> {
    status: ApiStatus;
    message?: string;
    data?: TData;
}
export declare class ApiError extends Error {
    readonly statusCode?: number;
    readonly payload?: unknown;
    constructor(message: string, options?: {
        statusCode?: number;
        payload?: unknown;
    });
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}
export interface LoginRequest {
    email: string;
    password: string;
}
export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}
