"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCommentSchema = exports.createCommentSchema = void 0;
const zod_1 = require("zod");
exports.createCommentSchema = zod_1.z.object({
    targetId: zod_1.z.string().min(1, 'Target ID is required'),
    targetType: zod_1.z.enum(['PROBLEM', 'CONTEST', 'DISCUSSION']),
    content: zod_1.z.string().min(1, 'Content cannot be empty').max(1000, 'Content exceeds 1000 characters'),
    parentId: zod_1.z.string().uuid('Invalid parent ID format').optional(),
});
exports.updateCommentSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, 'Content cannot be empty').max(1000, 'Content exceeds 1000 characters'),
});
