"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unbanUser = exports.banUser = exports.updateUserRole = exports.adminUpdateUser = exports.findUserByIdAdmin = exports.getAllUsers = exports.getUserActivities = exports.getUserEloHistory = exports.getUserTagStats = exports.getUserBadges = exports.getUserContests = exports.removeUserAvatar = exports.updateUserAvatar = exports.findUserByUsername = exports.updateUserById = exports.findUserById = void 0;
const prisma_1 = require("../config/prisma");
const findUserById = async (id) => {
    return prisma_1.prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            username: true,
            email: true,
            avatar_url: true,
            role: true,
            elo_rating: true,
            streak_count: true,
            max_streak: true,
            code_coins: true,
            bio: true,
            full_name: true,
            created_at: true,
            last_active_date: true,
        },
    });
};
exports.findUserById = findUserById;
const updateUserById = async (id, data) => {
    return prisma_1.prisma.user.update({
        where: { id },
        data: {
            full_name: data.full_name,
            bio: data.bio,
        },
        select: {
            id: true,
            username: true,
            email: true,
            avatar_url: true,
            role: true,
            elo_rating: true,
            streak_count: true,
            max_streak: true,
            code_coins: true,
            bio: true,
            full_name: true,
            created_at: true,
            updated_at: true,
        },
    });
};
exports.updateUserById = updateUserById;
const findUserByUsername = async (username) => {
    return prisma_1.prisma.user.findUnique({
        where: { username },
        select: {
            id: true,
            username: true,
            avatar_url: true,
            role: true,
            elo_rating: true,
            streak_count: true,
            max_streak: true,
            code_coins: true,
            bio: true,
            full_name: true,
            created_at: true,
        },
    });
};
exports.findUserByUsername = findUserByUsername;
const updateUserAvatar = async (id, avatarUrl) => {
    return prisma_1.prisma.user.update({
        where: { id },
        data: { avatar_url: avatarUrl },
        select: { id: true, username: true, avatar_url: true },
    });
};
exports.updateUserAvatar = updateUserAvatar;
const removeUserAvatar = async (id) => {
    return prisma_1.prisma.user.update({
        where: { id },
        data: { avatar_url: null },
        select: {
            id: true,
            username: true,
            avatar_url: true,
        },
    });
};
exports.removeUserAvatar = removeUserAvatar;
const getUserContests = async (userId, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const [contests, total] = await Promise.all([
        prisma_1.prisma.contestRegistration.findMany({
            where: { user_id: userId },
            skip,
            take: limit,
            orderBy: { registered_at: 'desc' },
            include: {
                contest: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        start_time: true,
                        end_time: true,
                    },
                },
            },
        }),
        prisma_1.prisma.contestRegistration.count({
            where: { user_id: userId },
        }),
    ]);
    return {
        contests: contests.map(reg => ({
            registered_at: reg.registered_at,
            contest: reg.contest,
        })),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};
exports.getUserContests = getUserContests;
const getUserBadges = async (userId) => {
    return prisma_1.prisma.userBadge.findMany({
        where: { user_id: userId },
        include: {
            badge: true,
        },
        orderBy: { earned_at: 'desc' },
    });
};
exports.getUserBadges = getUserBadges;
const getUserTagStats = async (userId) => {
    return prisma_1.prisma.userTagStat.findMany({
        where: { user_id: userId },
        include: {
            tag: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    color: true,
                },
            },
        },
        orderBy: {
            problems_solved: 'desc',
        },
    });
};
exports.getUserTagStats = getUserTagStats;
const getUserEloHistory = async (userId, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const [history, total] = await Promise.all([
        prisma_1.prisma.eloHistory.findMany({
            where: { user_id: userId },
            skip,
            take: limit,
            orderBy: { created_at: 'desc' },
        }),
        prisma_1.prisma.eloHistory.count({
            where: { user_id: userId },
        }),
    ]);
    return {
        history,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};
exports.getUserEloHistory = getUserEloHistory;
const getUserActivities = async (userId, startDate, endDate) => {
    return prisma_1.prisma.userActivity.findMany({
        where: {
            user_id: userId,
            activity_date: {
                gte: startDate,
                lte: endDate,
            },
        },
        orderBy: {
            activity_date: 'asc',
        },
    });
};
exports.getUserActivities = getUserActivities;
const getAllUsers = async (page = 1, limit = 10, search) => {
    const skip = (page - 1) * limit;
    const whereClause = {};
    if (search) {
        whereClause.OR = [
            { username: { contains: search } },
            { email: { contains: search } },
            { full_name: { contains: search } },
        ];
    }
    const [users, total] = await Promise.all([
        prisma_1.prisma.user.findMany({
            where: whereClause,
            skip,
            take: limit,
            orderBy: { created_at: 'desc' },
            select: {
                id: true,
                username: true,
                email: true,
                avatar_url: true,
                role: true,
                elo_rating: true,
                streak_count: true,
                max_streak: true,
                code_coins: true,
                bio: true,
                full_name: true,
                is_banned: true,
                created_at: true,
                last_active_date: true,
            },
        }),
        prisma_1.prisma.user.count({ where: whereClause }),
    ]);
    return {
        users,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};
exports.getAllUsers = getAllUsers;
const findUserByIdAdmin = async (id) => {
    return prisma_1.prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            username: true,
            email: true,
            avatar_url: true,
            role: true,
            elo_rating: true,
            streak_count: true,
            max_streak: true,
            code_coins: true,
            bio: true,
            full_name: true,
            is_banned: true,
            banned_at: true,
            banned_reason: true,
            last_active_date: true,
            created_at: true,
            updated_at: true,
        },
    });
};
exports.findUserByIdAdmin = findUserByIdAdmin;
const adminUpdateUser = async (id, data) => {
    return prisma_1.prisma.user.update({
        where: { id },
        data: {
            username: data.username,
            email: data.email,
            full_name: data.full_name,
            bio: data.bio,
            elo_rating: data.elo_rating,
            code_coins: data.code_coins,
        },
        select: {
            id: true,
            username: true,
            email: true,
            avatar_url: true,
            role: true,
            elo_rating: true,
            streak_count: true,
            max_streak: true,
            code_coins: true,
            bio: true,
            full_name: true,
            is_banned: true,
            created_at: true,
            updated_at: true,
        },
    });
};
exports.adminUpdateUser = adminUpdateUser;
const updateUserRole = async (id, role) => {
    return prisma_1.prisma.user.update({
        where: { id },
        data: { role },
        select: {
            id: true,
            username: true,
            email: true,
            role: true,
            updated_at: true,
        },
    });
};
exports.updateUserRole = updateUserRole;
const banUser = async (id, reason) => {
    return prisma_1.prisma.user.update({
        where: { id },
        data: {
            is_banned: true,
            banned_at: new Date(),
            banned_reason: reason || null,
        },
        select: {
            id: true,
            username: true,
            email: true,
            is_banned: true,
            banned_at: true,
            banned_reason: true,
        },
    });
};
exports.banUser = banUser;
const unbanUser = async (id) => {
    return prisma_1.prisma.user.update({
        where: { id },
        data: {
            is_banned: false,
            banned_at: null,
            banned_reason: null,
        },
        select: {
            id: true,
            username: true,
            email: true,
            is_banned: true,
            banned_at: true,
            banned_reason: true,
        },
    });
};
exports.unbanUser = unbanUser;
