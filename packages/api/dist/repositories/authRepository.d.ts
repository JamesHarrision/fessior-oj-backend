import type { IUser } from '@ocj/types';
import type { AuthTokens, LoginRequest, RegisterRequest } from '../types';
import { HttpClient } from '../httpClient';
export interface LoginResponseData extends AuthTokens {
    user: IUser;
}
export interface RegisterResponseData extends Partial<AuthTokens> {
    user?: IUser;
}
export declare class AuthRepository {
    private readonly http;
    constructor(http: HttpClient);
    login(payload: LoginRequest): Promise<LoginResponseData>;
    register(payload: RegisterRequest): Promise<RegisterResponseData>;
    me(): Promise<IUser>;
    logout(payload: {
        refreshToken: string | null;
    }): Promise<{
        ok: true;
    }>;
}
