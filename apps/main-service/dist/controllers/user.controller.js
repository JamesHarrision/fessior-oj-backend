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
exports.unbanUser = exports.banUser = exports.updateUserRole = exports.adminUpdateUser = exports.getUserStreakByUsername = exports.getUserEloHistoryByUsername = exports.getUserTagStatsByUsername = exports.getUserSubmissionsByUsername = exports.getUserByIdAdmin = exports.getAllUsers = exports.getUserStreak = exports.getUserEloHistory = exports.getUserTagStats = exports.getUserBadges = exports.getUserContests = exports.getUserSubmissions = exports.deleteAvatar = exports.uploadAvatar = exports.getUserByUsername = exports.updateMe = exports.getMe = void 0;
const userService = __importStar(require("../services/user.service"));
const getMe = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ status: 'Error', message: 'Unauthorized' });
            return;
        }
        const user = await userService.getMe(userId);
        res.status(200).json({
            status: 'Success',
            message: 'User profile retrieved successfully',
            data: user,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMe = getMe;
const updateMe = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ status: 'Error', message: 'Unauthorized' });
            return;
        }
        const { full_name, bio } = req.body;
        const updatedUser = await userService.updateMe(userId, { full_name, bio });
        res.status(200).json({
            status: 'Success',
            message: 'User profile updated successfully',
            data: updatedUser,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateMe = updateMe;
const getUserByUsername = async (req, res, next) => {
    try {
        const { username } = req.params;
        if (!username || typeof username !== 'string') {
            res.status(400).json({ status: 'Error', message: 'Invalid username' });
            return;
        }
        const user = await userService.getUserByUsername(username);
        res.status(200).json({
            status: 'Success',
            message: 'User profile retrieved successfully',
            data: user,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserByUsername = getUserByUsername;
const uploadAvatar = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ status: 'Error', message: 'Unauthorized' });
            return;
        }
        if (!req.file) {
            res.status(400).json({ status: 'Error', message: 'No file uploaded' });
            return;
        }
        const user = await userService.uploadUserAvatar(userId, req.file.buffer);
        res.status(200).json({
            status: 'Success',
            message: 'Avatar uploaded successfully',
            data: user,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.uploadAvatar = uploadAvatar;
const deleteAvatar = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ status: 'Error', message: 'Unauthorized' });
            return;
        }
        const currentUser = await userService.getMe(userId);
        const currentAvatarUrl = currentUser.avatar_url;
        const user = await userService.deleteUserAvatar(userId, currentAvatarUrl);
        res.status(200).json({
            status: 'Success',
            message: 'Avatar deleted successfully',
            data: user,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteAvatar = deleteAvatar;
const getUserSubmissions = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ status: 'Error', message: 'Unauthorized' });
            return;
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await userService.getUserSubmissions(userId, page, limit);
        res.status(200).json({
            status: 'Success',
            message: 'User submissions retrieved successfully',
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserSubmissions = getUserSubmissions;
const getUserContests = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ status: 'Error', message: 'Unauthorized' });
            return;
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await userService.getUserContests(userId, page, limit);
        res.status(200).json({
            status: 'Success',
            message: 'User contests retrieved successfully',
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserContests = getUserContests;
const getUserBadges = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ status: 'Error', message: 'Unauthorized' });
            return;
        }
        const badges = await userService.getUserBadges(userId);
        res.status(200).json({
            status: 'Success',
            message: 'User badges retrieved successfully',
            data: badges,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserBadges = getUserBadges;
const getUserTagStats = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ status: 'Error', message: 'Unauthorized' });
            return;
        }
        const tagStats = await userService.getUserTagStats(userId);
        res.status(200).json({
            status: 'Success',
            message: 'User tag statistics retrieved successfully',
            data: tagStats,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserTagStats = getUserTagStats;
const getUserEloHistory = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ status: 'Error', message: 'Unauthorized' });
            return;
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await userService.getUserEloHistory(userId, page, limit);
        res.status(200).json({
            status: 'Success',
            message: 'User ELO history retrieved successfully',
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserEloHistory = getUserEloHistory;
const getUserStreak = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ status: 'Error', message: 'Unauthorized' });
            return;
        }
        const streakData = await userService.getUserStreak(userId);
        res.status(200).json({
            status: 'Success',
            message: 'User streak and heatmap retrieved successfully',
            data: streakData,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserStreak = getUserStreak;
const getAllUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search;
        const result = await userService.getAllUsers(page, limit, search);
        res.status(200).json({
            status: 'Success',
            message: 'Users retrieved successfully',
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllUsers = getAllUsers;
const getUserByIdAdmin = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id || typeof id !== 'string') {
            res.status(400).json({ status: 'Error', message: 'Invalid user ID' });
            return;
        }
        const user = await userService.getUserByIdAdmin(id);
        res.status(200).json({
            status: 'Success',
            message: 'User retrieved successfully',
            data: user,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserByIdAdmin = getUserByIdAdmin;
const getUserSubmissionsByUsername = async (req, res, next) => {
    try {
        const { username } = req.params;
        if (!username || typeof username !== 'string') {
            res.status(400).json({ status: 'Error', message: 'Invalid username' });
            return;
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await userService.getUserSubmissionsByUsername(username, page, limit);
        res.status(200).json({
            status: 'Success',
            message: 'User submissions retrieved successfully',
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserSubmissionsByUsername = getUserSubmissionsByUsername;
const getUserTagStatsByUsername = async (req, res, next) => {
    try {
        const { username } = req.params;
        if (!username || typeof username !== 'string') {
            res.status(400).json({ status: 'Error', message: 'Invalid username' });
            return;
        }
        const result = await userService.getUserTagStatsByUsername(username);
        res.status(200).json({
            status: 'Success',
            message: 'User tag statistics retrieved successfully',
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserTagStatsByUsername = getUserTagStatsByUsername;
const getUserEloHistoryByUsername = async (req, res, next) => {
    try {
        const { username } = req.params;
        if (!username || typeof username !== 'string') {
            res.status(400).json({ status: 'Error', message: 'Invalid username' });
            return;
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await userService.getUserEloHistoryByUsername(username, page, limit);
        res.status(200).json({
            status: 'Success',
            message: 'User ELO history retrieved successfully',
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserEloHistoryByUsername = getUserEloHistoryByUsername;
const getUserStreakByUsername = async (req, res, next) => {
    try {
        const { username } = req.params;
        if (!username || typeof username !== 'string') {
            res.status(400).json({ status: 'Error', message: 'Invalid username' });
            return;
        }
        const result = await userService.getUserStreakByUsername(username);
        res.status(200).json({
            status: 'Success',
            message: 'User streak retrieved successfully',
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserStreakByUsername = getUserStreakByUsername;
const adminUpdateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id || typeof id !== 'string') {
            res.status(400).json({ status: 'Error', message: 'Invalid user ID' });
            return;
        }
        const updatedUser = await userService.adminUpdateUser(id, req.body);
        res.status(200).json({
            status: 'Success',
            message: 'User updated successfully',
            data: updatedUser,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.adminUpdateUser = adminUpdateUser;
const updateUserRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        if (!id || typeof id !== 'string') {
            res.status(400).json({ status: 'Error', message: 'Invalid user ID' });
            return;
        }
        const updatedUser = await userService.updateUserRole(id, role);
        res.status(200).json({
            status: 'Success',
            message: 'User role updated successfully',
            data: updatedUser,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateUserRole = updateUserRole;
const banUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        if (!id || typeof id !== 'string') {
            res.status(400).json({ status: 'Error', message: 'Invalid user ID' });
            return;
        }
        const bannedUser = await userService.banUser(id, reason);
        res.status(200).json({
            status: 'Success',
            message: 'User banned successfully',
            data: bannedUser,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.banUser = banUser;
const unbanUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id || typeof id !== 'string') {
            res.status(400).json({ status: 'Error', message: 'Invalid user ID' });
            return;
        }
        const unbannedUser = await userService.unbanUser(id);
        res.status(200).json({
            status: 'Success',
            message: 'User unbanned successfully',
            data: unbannedUser,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.unbanUser = unbanUser;
