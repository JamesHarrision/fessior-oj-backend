export declare const getMe: (userId: string) => Promise<{
    id: string;
    username: string;
    email: string;
    bio: string;
    full_name: string;
    avatar_url: string;
    role: import(".prisma/client").$Enums.Role;
    elo_rating: number;
    streak_count: number;
    max_streak: number;
    last_active_date: Date;
    code_coins: number;
    created_at: Date;
}>;
export declare const updateMe: (userId: string, data: {
    full_name?: string;
    bio?: string;
}) => Promise<{
    id: string;
    username: string;
    email: string;
    bio: string;
    full_name: string;
    avatar_url: string;
    role: import(".prisma/client").$Enums.Role;
    elo_rating: number;
    streak_count: number;
    max_streak: number;
    code_coins: number;
    created_at: Date;
    updated_at: Date;
}>;
export declare const getUserByUsername: (username: string) => Promise<{
    id: string;
    username: string;
    bio: string;
    full_name: string;
    avatar_url: string;
    role: import(".prisma/client").$Enums.Role;
    elo_rating: number;
    streak_count: number;
    max_streak: number;
    code_coins: number;
    created_at: Date;
}>;
export declare const uploadUserAvatar: (userId: string, fileBuffer: Buffer) => Promise<{
    id: string;
    username: string;
    avatar_url: string;
}>;
export declare const deleteUserAvatar: (userId: string, currentAvatarUrl: string | null) => Promise<{
    id: string;
    username: string;
    avatar_url: string;
}>;
export declare const getUserSubmissions: (userId: string, page?: number, limit?: number) => Promise<{
    submissions: (import("mongoose").Document<unknown, {}, import("../models/submission.model").ISubmission, {}, import("mongoose").DefaultSchemaOptions> & import("../models/submission.model").ISubmission & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
export declare const getUserContests: (userId: string, page?: number, limit?: number) => Promise<{
    contests: {
        registered_at: Date;
        contest: {
            id: string;
            title: string;
            description: string;
            start_time: Date;
            end_time: Date;
        };
    }[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
export declare const getUserBadges: (userId: string) => Promise<{
    id: string;
    name: string;
    slug: string;
    description: string;
    icon_url: string;
    type: import(".prisma/client").$Enums.BadgeType;
    earned_at: Date;
}[]>;
export declare const getUserTagStats: (userId: string) => Promise<{
    tag_id: string;
    tag_name: string;
    tag_slug: string;
    tag_color: string;
    problems_solved: number;
}[]>;
export declare const getUserEloHistory: (userId: string, page?: number, limit?: number) => Promise<{
    history: {
        id: string;
        created_at: Date;
        user_id: string;
        old_elo: number;
        new_elo: number;
        change: number;
        reason: string;
        match_id: string | null;
    }[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
export declare const getUserStreak: (userId: string) => Promise<{
    current_streak: number;
    max_streak: number;
    last_active_date: any;
    heatmap: Record<string, number>;
}>;
export declare const getAllUsers: (page: number, limit: number, search?: string) => Promise<{
    users: {
        id: string;
        username: string;
        email: string;
        bio: string;
        full_name: string;
        avatar_url: string;
        role: import(".prisma/client").$Enums.Role;
        elo_rating: number;
        streak_count: number;
        max_streak: number;
        last_active_date: Date;
        code_coins: number;
        created_at: Date;
        is_banned: boolean;
    }[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
export declare const getUserByIdAdmin: (userId: string) => Promise<{
    id: string;
    username: string;
    email: string;
    bio: string;
    full_name: string;
    avatar_url: string;
    role: import(".prisma/client").$Enums.Role;
    elo_rating: number;
    streak_count: number;
    max_streak: number;
    last_active_date: Date;
    code_coins: number;
    created_at: Date;
    updated_at: Date;
    is_banned: boolean;
    banned_at: Date;
    banned_reason: string;
}>;
export declare const getUserSubmissionsByUsername: (username: string, page?: number, limit?: number) => Promise<{
    username: string;
    submissions: (import("mongoose").Document<unknown, {}, import("../models/submission.model").ISubmission, {}, import("mongoose").DefaultSchemaOptions> & import("../models/submission.model").ISubmission & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
export declare const getUserTagStatsByUsername: (username: string) => Promise<{
    username: string;
    tag_stats: {
        tag_id: string;
        tag_name: string;
        tag_slug: string;
        tag_color: string;
        problems_solved: number;
    }[];
}>;
export declare const getUserEloHistoryByUsername: (username: string, page?: number, limit?: number) => Promise<{
    history: {
        id: string;
        created_at: Date;
        user_id: string;
        old_elo: number;
        new_elo: number;
        change: number;
        reason: string;
        match_id: string | null;
    }[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
export declare const getUserStreakByUsername: (username: string) => Promise<{
    current_streak: number;
    max_streak: number;
    last_active_date: any;
    heatmap: Record<string, number>;
}>;
export declare const adminUpdateUser: (id: string, data: {
    username?: string;
    email?: string;
    full_name?: string;
    bio?: string;
    elo_rating?: number;
    code_coins?: number;
}) => Promise<{
    id: string;
    username: string;
    email: string;
    bio: string;
    full_name: string;
    avatar_url: string;
    role: import(".prisma/client").$Enums.Role;
    elo_rating: number;
    streak_count: number;
    max_streak: number;
    code_coins: number;
    created_at: Date;
    updated_at: Date;
    is_banned: boolean;
}>;
export declare const updateUserRole: (id: string, role: "USER" | "ADMIN") => Promise<{
    id: string;
    username: string;
    email: string;
    role: import(".prisma/client").$Enums.Role;
    updated_at: Date;
}>;
export declare const banUser: (id: string, reason?: string) => Promise<{
    id: string;
    username: string;
    email: string;
    is_banned: boolean;
    banned_at: Date;
    banned_reason: string;
}>;
export declare const unbanUser: (id: string) => Promise<{
    id: string;
    username: string;
    email: string;
    is_banned: boolean;
    banned_at: Date;
    banned_reason: string;
}>;
