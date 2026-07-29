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
exports.resetPassword = exports.forgotPassword = exports.getUserSessions = exports.revokeAllSessions = exports.revokeSession = exports.changePassword = exports.getMe = exports.refresh = exports.logout = exports.login = exports.register = void 0;
const authService = __importStar(require("../services/auth.service"));
const register = async (req, res, next) => {
    try {
        const user = await authService.register(req.body);
        res.status(201).json({
            status: 'Success',
            message: 'User registered successfully',
            data: user,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const data = await authService.login(req.body);
        res.status(200).json({
            status: 'Success',
            message: 'Login successful',
            data,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const logout = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        await authService.logout(refreshToken);
        res.status(200).json({
            status: 'Success',
            message: 'Logged out successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.logout = logout;
const refresh = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        const data = await authService.refresh(refreshToken);
        res.status(200).json({
            status: 'Success',
            message: 'Token refreshed successfully',
            data,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.refresh = refresh;
const getMe = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ status: 'Error', message: 'Unauthorized' });
            return;
        }
        const user = await authService.getMe(userId);
        res.status(200).json({
            status: 'Success',
            message: 'User fetched successfully',
            data: user,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMe = getMe;
const changePassword = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ status: 'Error', message: 'Unauthorized' });
            return;
        }
        const { oldPassword, newPassword } = req.body;
        await authService.changePassword(userId, oldPassword, newPassword);
        res.status(200).json({
            status: 'Success',
            message: 'Password changed successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.changePassword = changePassword;
const revokeSession = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ status: 'Error', message: 'Unauthorized' });
            return;
        }
        const { sessionId } = req.params;
        if (!sessionId || typeof sessionId !== 'string') {
            res.status(400).json({ status: 'Error', message: 'Invalid session ID' });
            return;
        }
        await authService.revokeSession(userId, sessionId);
        res.status(200).json({
            status: 'Success',
            message: 'Session revoked successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.revokeSession = revokeSession;
const revokeAllSessions = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ status: 'Error', message: 'Unauthorized' });
            return;
        }
        await authService.revokeAllSessions(userId);
        res.status(200).json({
            status: 'Success',
            message: 'All sessions revoked successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.revokeAllSessions = revokeAllSessions;
const getUserSessions = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ status: 'Error', message: 'Unauthorized' });
            return;
        }
        const data = await authService.getUserSessions(userId);
        res.status(200).json({
            status: 'Success',
            message: 'Sessions retrieved successfully',
            data,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserSessions = getUserSessions;
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const result = await authService.forgotPassword(email);
        res.status(200).json({
            status: 'Success',
            message: result.message,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;
        const result = await authService.resetPassword(token, newPassword);
        res.status(200).json({
            status: 'Success',
            message: result.message,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.resetPassword = resetPassword;
