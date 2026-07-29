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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.getUserSessions = exports.revokeAllSessions = exports.revokeSession = exports.changePassword = exports.getMe = exports.refresh = exports.logout = exports.login = exports.register = void 0;
const errors_1 = require("@ocj/errors");
const authRepo = __importStar(require("../repositories/auth.repository"));
const password_util_1 = require("../utils/password.util");
const jwt_util_1 = require("../utils/jwt.util");
const crypto_1 = __importDefault(require("crypto"));
const email_service_1 = require("./email.service");
const register = async (data) => {
    const existingEmail = await authRepo.findUserByEmail(data.email);
    if (existingEmail) {
        throw new errors_1.AppError('Email already in use', 400);
    }
    const existingUsername = await authRepo.findUserByUsername(data.username);
    if (existingUsername) {
        throw new errors_1.AppError('Username already taken', 400);
    }
    const passwordHash = await (0, password_util_1.hashPassword)(data.password);
    const user = await authRepo.createUser({
        username: data.username,
        email: data.email,
        password_hash: passwordHash,
    });
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
};
exports.register = register;
const login = async (data) => {
    const user = await authRepo.findUserByEmail(data.email);
    if (!user || !user.password_hash) {
        throw new errors_1.AppError('Invalid email or password', 401);
    }
    if (user.is_banned) {
        throw new errors_1.AppError('Your account has been banned. Please contact support.', 401);
    }
    const isPasswordValid = await (0, password_util_1.comparePassword)(data.password, user.password_hash);
    if (!isPasswordValid) {
        throw new errors_1.AppError('Invalid email or password', 401);
    }
    const payload = { userId: user.id, role: user.role };
    const accessToken = (0, jwt_util_1.generateAccessToken)(payload);
    const refreshToken = (0, jwt_util_1.generateRefreshToken)(payload);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
    await authRepo.saveRefreshToken(user.id, refreshToken, expiresAt);
    const { password_hash, ...userWithoutPassword } = user;
    return {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
    };
};
exports.login = login;
const logout = async (refreshToken) => {
    if (!refreshToken)
        return;
    try {
        await authRepo.deleteRefreshToken(refreshToken);
    }
    catch (error) {
        // Ignore errors if token doesn't exist
    }
};
exports.logout = logout;
const refresh = async (token) => {
    if (!token) {
        throw new errors_1.AppError('Refresh token is required', 400);
    }
    const storedToken = await authRepo.findRefreshToken(token);
    if (!storedToken) {
        throw new errors_1.AppError('Invalid refresh token', 401);
    }
    if (storedToken.expires_at < new Date()) {
        await authRepo.deleteRefreshToken(token);
        throw new errors_1.AppError('Refresh token expired', 401);
    }
    try {
        const decoded = (0, jwt_util_1.verifyRefreshToken)(token);
        const payload = { userId: decoded.userId, role: decoded.role };
        const newAccessToken = (0, jwt_util_1.generateAccessToken)(payload);
        return { accessToken: newAccessToken };
    }
    catch (error) {
        await authRepo.deleteRefreshToken(token);
        throw new errors_1.AppError('Invalid refresh token', 401);
    }
};
exports.refresh = refresh;
const getMe = async (userId) => {
    const user = await authRepo.findUserById(userId);
    if (!user) {
        throw new errors_1.AppError('User not found', 404);
    }
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
};
exports.getMe = getMe;
const changePassword = async (userId, oldPassword, newPassword) => {
    const user = await authRepo.findUserById(userId);
    if (!user) {
        throw new errors_1.AppError('User not found', 404);
    }
    if (!user || !user.password_hash) {
        throw new errors_1.AppError('Invalid email or password', 401);
    }
    const isPasswordValid = await (0, password_util_1.comparePassword)(oldPassword, user.password_hash);
    if (!isPasswordValid) {
        throw new errors_1.AppError('Current password is incorrect', 401);
    }
    const newPasswordHash = await (0, password_util_1.hashPassword)(newPassword);
    await authRepo.updateUserPassword(userId, newPasswordHash);
    (0, exports.revokeAllSessions)(userId);
    return { message: 'Password changed successfully' };
};
exports.changePassword = changePassword;
const revokeSession = async (userId, sessionId) => {
    const token = await authRepo.findRefreshTokenById(sessionId);
    if (!token) {
        throw new errors_1.AppError('Session not found', 404);
    }
    if (token.user_id !== userId) {
        throw new errors_1.AppError('You are not authorized to revoke this session', 403);
    }
    await authRepo.revokeRefreshTokenById(sessionId);
    return { message: 'Session revoked successfully' };
};
exports.revokeSession = revokeSession;
const revokeAllSessions = async (userId) => {
    await authRepo.revokeAllUserSessions(userId);
    return { message: 'All sessions revoked successfully' };
};
exports.revokeAllSessions = revokeAllSessions;
const getUserSessions = async (userId) => {
    const sessions = await authRepo.getUserSessions(userId);
    return { sessions };
};
exports.getUserSessions = getUserSessions;
const forgotPassword = async (email) => {
    const user = await authRepo.findUserByEmail(email);
    if (!user) {
        return { message: 'If email exists, reset link has been sent' };
    }
    const resetToken = crypto_1.default.randomUUID();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // Expires in 15 minutes
    await authRepo.createPasswordResetToken(user.id, resetToken, expiresAt);
    try {
        await (0, email_service_1.sendResetPasswordEmail)(email, resetToken);
    }
    catch (error) {
        console.error('Email sending failed:', error);
    }
    return { message: 'If email exists, reset link has been sent' };
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (token, newPassword) => {
    const resetToken = await authRepo.findValidResetToken(token);
    if (!resetToken) {
        throw new errors_1.AppError('Invalid or expired reset token', 400);
    }
    const newPasswordHash = await (0, password_util_1.hashPassword)(newPassword);
    await authRepo.updateUserPassword(resetToken.user_id, newPasswordHash);
    await authRepo.markResetTokenAsUsed(resetToken.id);
    await authRepo.revokeAllUserSessions(resetToken.user_id);
    return { message: 'Password has been reset successfully' };
};
exports.resetPassword = resetPassword;
