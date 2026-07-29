import { z } from 'zod';
import { registerSchema, loginSchema } from '../validators/auth.validator';
type RegisterInput = z.infer<typeof registerSchema>;
type LoginInput = z.infer<typeof loginSchema>;
export declare const register: (data: RegisterInput) => Promise<{
    id: string;
    username: string;
    email: string;
    bio: string | null;
    full_name: string | null;
    avatar_url: string | null;
    role: import(".prisma/client").$Enums.Role;
    elo_rating: number;
    streak_count: number;
    max_streak: number;
    last_active_date: Date | null;
    code_coins: number;
    created_at: Date;
    updated_at: Date;
    is_banned: boolean;
    banned_at: Date | null;
    banned_reason: string | null;
}>;
export declare const login: (data: LoginInput) => Promise<{
    user: {
        id: string;
        username: string;
        email: string;
        bio: string | null;
        full_name: string | null;
        avatar_url: string | null;
        role: import(".prisma/client").$Enums.Role;
        elo_rating: number;
        streak_count: number;
        max_streak: number;
        last_active_date: Date | null;
        code_coins: number;
        created_at: Date;
        updated_at: Date;
        is_banned: boolean;
        banned_at: Date | null;
        banned_reason: string | null;
    };
    accessToken: string;
    refreshToken: string;
}>;
export declare const logout: (refreshToken: string) => Promise<void>;
export declare const refresh: (token: string) => Promise<{
    accessToken: string;
}>;
export declare const getMe: (userId: string) => Promise<{
    id: string;
    username: string;
    email: string;
    bio: string | null;
    full_name: string | null;
    avatar_url: string | null;
    role: import(".prisma/client").$Enums.Role;
    elo_rating: number;
    streak_count: number;
    max_streak: number;
    last_active_date: Date | null;
    code_coins: number;
    created_at: Date;
    updated_at: Date;
    is_banned: boolean;
    banned_at: Date | null;
    banned_reason: string | null;
}>;
export declare const changePassword: (userId: string, oldPassword: string, newPassword: string) => Promise<{
    message: string;
}>;
export declare const revokeSession: (userId: string, sessionId: string) => Promise<{
    message: string;
}>;
export declare const revokeAllSessions: (userId: string) => Promise<{
    message: string;
}>;
export declare const getUserSessions: (userId: string) => Promise<{
    sessions: {
        id: string;
        created_at: Date;
        expires_at: Date;
        user_agent: string;
        ip_address: string;
        last_used_at: Date;
    }[];
}>;
export declare const forgotPassword: (email: string) => Promise<{
    message: string;
}>;
export declare const resetPassword: (token: string, newPassword: string) => Promise<{
    message: string;
}>;
export {};
