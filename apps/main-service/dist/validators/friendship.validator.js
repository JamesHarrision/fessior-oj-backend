"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.friendDeclineSchema = exports.friendAcceptSchema = exports.friendRequestSchema = void 0;
const zod_1 = require("zod");
exports.friendRequestSchema = zod_1.z.object({
    receiverId: zod_1.z.string().min(1, 'Receiver ID or username is required'),
});
exports.friendAcceptSchema = zod_1.z.object({
    senderId: zod_1.z.string().uuid('Invalid sender ID format'),
});
exports.friendDeclineSchema = zod_1.z.object({
    senderId: zod_1.z.string().uuid('Invalid sender ID format'),
});
