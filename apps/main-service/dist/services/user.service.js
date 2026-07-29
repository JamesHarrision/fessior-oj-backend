"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.unbanUser = exports.banUser = exports.updateUserRole = exports.adminUpdateUser = exports.getUserStreakByUsername = exports.getUserEloHistoryByUsername = exports.getUserTagStatsByUsername = exports.getUserSubmissionsByUsername = exports.getUserByIdAdmin = exports.getAllUsers = exports.getUserStreak = exports.getUserEloHistory = exports.getUserTagStats = exports.getUserBadges = exports.getUserContests = exports.getUserSubmissions = exports.deleteUserAvatar = exports.uploadUserAvatar = exports.getUserByUsername = exports.updateMe = exports.getMe = void 0;
const userRepo = __importStar(require("../repositories/user.repository"));
const authRepo = __importStar(require("../repositories/auth.repository"));
const errors_1 = require("@ocj/errors");
const cloudinary_service_1 = require("./cloudinary.service");
const submission_model_1 = require("../models/submission.model");
const getMe = async (userId) => {
    const user = await userRepo.findUserById(userId);
    if (!user) {
        throw new errors_1.AppError('User not found', 404);
    }
    return user;
};
exports.getMe = getMe;
const updateMe = async (userId, data) => {
    const user = await userRepo.updateUserById(userId, data);
    if (!user) {
        throw new errors_1.AppError('User not found', 404);
    }
    return user;
};
exports.updateMe = updateMe;
const getUserByUsername = async (username) => {
    const user = await userRepo.findUserByUsername(username);
    if (!user) {
        throw new errors_1.AppError('User not found', 404);
    }
    return user;
};
exports.getUserByUsername = getUserByUsername;
const uploadUserAvatar = async (userId, fileBuffer) => {
    const avatarUrl = await (0, cloudinary_service_1.uploadAvatar)(fileBuffer, userId);
    const user = await userRepo.updateUserAvatar(userId, avatarUrl);
    return user;
};
exports.uploadUserAvatar = uploadUserAvatar;
const deleteUserAvatar = async (userId, currentAvatarUrl) => {
    try {
        if (currentAvatarUrl) {
            await (0, cloudinary_service_1.deleteAvatar)(currentAvatarUrl);
        }
    }
    catch (error) {
        console.error('Cloudinary deletion error:', error);
    }
    const user = await userRepo.removeUserAvatar(userId);
    return user;
};
exports.deleteUserAvatar = deleteUserAvatar;
const getUserSubmissions = async (userId, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const [submissions, total] = await Promise.all([
        submission_model_1.Submission.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('problemId', 'title slug difficulty'),
        submission_model_1.Submission.countDocuments({ userId }),
    ]);
    return {
        submissions,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};
exports.getUserSubmissions = getUserSubmissions;
const getUserContests = async (userId, page = 1, limit = 10) => {
    return await userRepo.getUserContests(userId, page, limit);
};
exports.getUserContests = getUserContests;
const getUserBadges = async (userId) => {
    const userBadges = await userRepo.getUserBadges(userId);
    return userBadges.map(ub => ({
        id: ub.badge.id,
        name: ub.badge.name,
        slug: ub.badge.slug,
        description: ub.badge.description,
        icon_url: ub.badge.icon_url,
        type: ub.badge.type,
        earned_at: ub.earned_at,
    }));
};
exports.getUserBadges = getUserBadges;
const getUserTagStats = async (userId) => {
    const tagStats = await userRepo.getUserTagStats(userId);
    return tagStats.map(ts => ({
        tag_id: ts.tag.id,
        tag_name: ts.tag.name,
        tag_slug: ts.tag.slug,
        tag_color: ts.tag.color,
        problems_solved: ts.problems_solved,
    }));
};
exports.getUserTagStats = getUserTagStats;
const getUserEloHistory = async (userId, page = 1, limit = 10) => {
    return await userRepo.getUserEloHistory(userId, page, limit);
};
exports.getUserEloHistory = getUserEloHistory;
const getUserStreak = async (userId) => {
    const user = await userRepo.findUserById(userId);
    if (!user) {
        throw new errors_1.AppError('User not found', 404);
    }
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 364);
    const activities = await userRepo.getUserActivities(userId, startDate, endDate);
    const heatmap = {};
    activities.forEach(activity => {
        const dateStr = activity.activity_date.toISOString().split('T')[0];
        heatmap[dateStr] = activity.problems_solved_count;
    });
    return {
        current_streak: user.streak_count,
        max_streak: user.max_streak,
        last_active_date: user.updated_at,
        heatmap,
    };
};
exports.getUserStreak = getUserStreak;
const getAllUsers = async (page, limit, search) => {
    return await userRepo.getAllUsers(page, limit, search);
};
exports.getAllUsers = getAllUsers;
const getUserByIdAdmin = async (userId) => {
    const user = await userRepo.findUserByIdAdmin(userId);
    if (!user) {
        throw new errors_1.AppError('User not found', 404);
    }
    return user;
};
exports.getUserByIdAdmin = getUserByIdAdmin;
const getUserSubmissionsByUsername = async (username, page = 1, limit = 10) => {
    const user = await userRepo.findUserByUsername(username);
    if (!user) {
        throw new errors_1.AppError('User not found', 404);
    }
    const skip = (page - 1) * limit;
    const [submissions, total] = await Promise.all([
        submission_model_1.Submission.find({
            userId: user.id,
            status: 'ACCEPTED',
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('problemId', 'title slug difficulty')
            .select('-code'),
        submission_model_1.Submission.countDocuments({
            userId: user.id,
            status: 'ACCEPTED',
        }),
    ]);
    return {
        username: user.username,
        submissions,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};
exports.getUserSubmissionsByUsername = getUserSubmissionsByUsername;
const getUserTagStatsByUsername = async (username) => {
    const user = await userRepo.findUserByUsername(username);
    if (!user) {
        throw new errors_1.AppError('User not found', 404);
    }
    const tagStats = await userRepo.getUserTagStats(user.id);
    return {
        username: user.username,
        tag_stats: tagStats.map(ts => ({
            tag_id: ts.tag.id,
            tag_name: ts.tag.name,
            tag_slug: ts.tag.slug,
            tag_color: ts.tag.color,
            problems_solved: ts.problems_solved,
        })),
    };
};
exports.getUserTagStatsByUsername = getUserTagStatsByUsername;
const getUserEloHistoryByUsername = async (username, page = 1, limit = 10) => {
    const user = await userRepo.findUserByUsername(username);
    if (!user) {
        throw new errors_1.AppError('User not found', 404);
    }
    return await userRepo.getUserEloHistory(user.id, page, limit);
};
exports.getUserEloHistoryByUsername = getUserEloHistoryByUsername;
const getUserStreakByUsername = async (username) => {
    const user = await userRepo.findUserByUsername(username);
    if (!user) {
        throw new errors_1.AppError('User not found', 404);
    }
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 364);
    const activities = await userRepo.getUserActivities(user.id, startDate, endDate);
    const heatmap = {};
    activities.forEach(activity => {
        const dateStr = activity.activity_date.toISOString().split('T')[0];
        heatmap[dateStr] = activity.problems_solved_count;
    });
    return {
        current_streak: user.streak_count,
        max_streak: user.max_streak,
        last_active_date: user.updated_at,
        heatmap,
    };
};
exports.getUserStreakByUsername = getUserStreakByUsername;
const adminUpdateUser = async (id, data) => {
    const existingUser = await userRepo.findUserByIdAdmin(id);
    if (!existingUser) {
        throw new errors_1.AppError('User not found', 404);
    }
    if (data.username) {
        const userWithSameUsername = await userRepo.findUserByUsername(data.username);
        if (userWithSameUsername && userWithSameUsername.id !== id) {
            throw new errors_1.AppError('Username already taken', 400);
        }
    }
    if (data.email) {
        const userWithSameEmail = await authRepo.findUserByEmail(data.email);
        if (userWithSameEmail && userWithSameEmail.id !== id) {
            throw new errors_1.AppError('Email already in use', 400);
        }
    }
    return await userRepo.adminUpdateUser(id, data);
};
exports.adminUpdateUser = adminUpdateUser;
const updateUserRole = async (id, role) => {
    const existingUser = await userRepo.findUserByIdAdmin(id);
    if (!existingUser) {
        throw new errors_1.AppError('User not found', 404);
    }
    return await userRepo.updateUserRole(id, role);
};
exports.updateUserRole = updateUserRole;
const banUser = async (id, reason) => {
    const existingUser = await userRepo.findUserByIdAdmin(id);
    if (!existingUser) {
        throw new errors_1.AppError('User not found', 404);
    }
    if (existingUser.is_banned) {
        throw new errors_1.AppError('User is already banned', 400);
    }
    return await userRepo.banUser(id, reason);
};
exports.banUser = banUser;
const unbanUser = async (id) => {
    const existingUser = await userRepo.findUserByIdAdmin(id);
    if (!existingUser) {
        throw new errors_1.AppError('User not found', 404);
    }
    if (!existingUser.is_banned) {
        throw new errors_1.AppError('User is not banned', 400);
    }
    return await userRepo.unbanUser(id);
};
exports.unbanUser = unbanUser;
