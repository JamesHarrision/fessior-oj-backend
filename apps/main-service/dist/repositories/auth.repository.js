"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markResetTokenAsUsed = exports.findValidResetToken = exports.createPasswordResetToken = exports.getUserSessions = exports.revokeAllUserSessions = exports.revokeRefreshTokenById = exports.findRefreshTokenById = exports.updateUserPassword = exports.deleteRefreshToken = exports.findRefreshToken = exports.saveRefreshToken = exports.createUser = exports.findUserById = exports.findUserByUsername = exports.findUserByEmail = void 0;
const prisma_1 = require("../config/prisma");
const findUserByEmail = async (email) => {
    return prisma_1.prisma.user.findUnique({ where: { email } });
};
exports.findUserByEmail = findUserByEmail;
const findUserByUsername = async (username) => {
    return prisma_1.prisma.user.findUnique({ where: { username } });
};
exports.findUserByUsername = findUserByUsername;
const findUserById = async (id) => {
    return prisma_1.prisma.user.findUnique({ where: { id } });
};
exports.findUserById = findUserById;
const createUser = async (data) => {
    return prisma_1.prisma.user.create({ data });
};
exports.createUser = createUser;
const saveRefreshToken = async (userId, token, expiresAt) => {
    return prisma_1.prisma.refreshToken.create({
        data: {
            user_id: userId,
            token,
            expires_at: expiresAt,
        },
    });
};
exports.saveRefreshToken = saveRefreshToken;
const findRefreshToken = async (token) => {
    return prisma_1.prisma.refreshToken.findUnique({
        where: { token },
        include: { user: true },
    });
};
exports.findRefreshToken = findRefreshToken;
const deleteRefreshToken = async (token) => {
    return prisma_1.prisma.refreshToken.delete({
        where: { token },
    });
};
exports.deleteRefreshToken = deleteRefreshToken;
const updateUserPassword = async (userId, newPasswordHash) => {
    return prisma_1.prisma.user.update({
        where: { id: userId },
        data: { password_hash: newPasswordHash },
    });
};
exports.updateUserPassword = updateUserPassword;
const findRefreshTokenById = async (tokenId) => {
    return prisma_1.prisma.refreshToken.findUnique({
        where: { id: tokenId },
    });
};
exports.findRefreshTokenById = findRefreshTokenById;
const revokeRefreshTokenById = async (tokenId) => {
    return prisma_1.prisma.refreshToken.update({
        where: { id: tokenId },
        data: { is_revoked: true },
    });
};
exports.revokeRefreshTokenById = revokeRefreshTokenById;
const revokeAllUserSessions = async (userId) => {
    return prisma_1.prisma.refreshToken.updateMany({
        where: {
            user_id: userId,
            is_revoked: false
        },
        data: { is_revoked: true },
    });
};
exports.revokeAllUserSessions = revokeAllUserSessions;
const getUserSessions = async (userId) => {
    return prisma_1.prisma.refreshToken.findMany({
        where: {
            user_id: userId,
            is_revoked: false,
            expires_at: { gt: new Date() },
        },
        orderBy: { created_at: 'desc' },
        select: {
            id: true,
            user_agent: true,
            ip_address: true,
            created_at: true,
            expires_at: true,
            last_used_at: true,
        },
    });
};
exports.getUserSessions = getUserSessions;
const createPasswordResetToken = async (userId, token, expiresAt) => {
    return prisma_1.prisma.passwordResetToken.create({
        data: {
            token,
            user_id: userId,
            expires_at: expiresAt,
        },
    });
};
exports.createPasswordResetToken = createPasswordResetToken;
const findValidResetToken = async (token) => {
    return prisma_1.prisma.passwordResetToken.findFirst({
        where: {
            token: token,
            used: false,
            expires_at: { gt: new Date() },
        },
    });
};
exports.findValidResetToken = findValidResetToken;
const markResetTokenAsUsed = async (tokenId) => {
    return prisma_1.prisma.passwordResetToken.update({
        where: { id: tokenId },
        data: { used: true },
    });
};
exports.markResetTokenAsUsed = markResetTokenAsUsed;
