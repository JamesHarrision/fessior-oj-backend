"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.requireAdmin = exports.requireAuth = void 0;
const jwt_util_1 = require("../utils/jwt.util");
const prisma_1 = require("../config/prisma");
const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ status: 'Error', message: 'Unauthorized' });
            return;
        }
        const token = authHeader.split(' ')[1];
        const decoded = (0, jwt_util_1.verifyAccessToken)(token);
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { is_banned: true },
        });
        if (!user || user.is_banned) {
            res.status(401).json({ status: 'Error', message: 'Your account has been banned.' });
            return;
        }
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({ status: 'Error', message: 'Invalid or expired token' });
        return;
    }
};
exports.requireAuth = requireAuth;
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'ADMIN') {
        res.status(403).json({ status: 'Error', message: 'Forbidden: Admin access required' });
        return;
    }
    next();
};
exports.requireAdmin = requireAdmin;
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = (0, jwt_util_1.verifyAccessToken)(token);
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: decoded.userId },
                select: { is_banned: true },
            });
            if (user && !user.is_banned) {
                req.user = decoded;
            }
        }
    }
    catch (error) {
        // Ignore error for optional auth
    }
    finally {
        next();
    }
};
exports.optionalAuth = optionalAuth;
