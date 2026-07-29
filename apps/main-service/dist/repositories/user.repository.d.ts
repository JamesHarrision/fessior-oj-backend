export declare const findUserById: (id: string) => Promise<{
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
export declare const updateUserById: (id: string, data: {
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
export declare const findUserByUsername: (username: string) => Promise<{
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
export declare const updateUserAvatar: (id: string, avatarUrl: string) => Promise<{
    id: string;
    username: string;
    avatar_url: string;
}>;
export declare const removeUserAvatar: (id: string) => Promise<{
    id: string;
    username: string;
    avatar_url: string;
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
export declare const getUserBadges: (userId: string) => Promise<({
    badge: {
        id: string;
        created_at: Date;
        name: string;
        type: import(".prisma/client").$Enums.BadgeType;
        description: string | null;
        slug: string;
        icon_url: string | null;
    };
} & {
    id: string;
    user_id: string;
    earned_at: Date;
    badge_id: string;
})[]>;
export declare const getUserTagStats: (userId: string) => Promise<({
    tag: {
        id: string;
        name: string;
        slug: string;
        color: string;
    };
} & {
    user_id: string;
    problems_solved: number;
    tag_id: string;
})[]>;
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
export declare const getUserActivities: (userId: string, startDate: Date, endDate: Date) => Promise<{
    id: string;
    user_id: string;
    activity_date: Date;
    submissions_count: number;
    problems_solved_count: number;
}[]>;
export declare const getAllUsers: (page?: number, limit?: number, search?: string) => Promise<{
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
export declare const findUserByIdAdmin: (id: string) => Promise<{
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
