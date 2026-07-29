"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.banUserSchema = exports.updateRoleSchema = exports.adminUpdateUserSchema = exports.updateMeSchema = void 0;
const zod_1 = require("zod");
exports.updateMeSchema = zod_1.z.object({
    full_name: zod_1.z.string().min(1).max(100).optional(),
    bio: zod_1.z.string().max(500).optional(),
});
exports.adminUpdateUserSchema = zod_1.z.object({
    username: zod_1.z.string().min(3).max(50).optional(),
    email: zod_1.z.string().email().optional(),
    full_name: zod_1.z.string().min(1).max(100).optional(),
    bio: zod_1.z.string().max(500).optional(),
    elo_rating: zod_1.z.number().int().min(0).max(3000).optional(),
    code_coins: zod_1.z.number().int().min(0).optional(),
});
exports.updateRoleSchema = zod_1.z.object({
    role: zod_1.z.enum(['USER', 'ADMIN']),
});
exports.banUserSchema = zod_1.z.object({
    reason: zod_1.z.string().max(255).optional(),
});
