"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRoomSchema = exports.joinRoomSchema = exports.createRoomSchema = void 0;
const zod_1 = require("zod");
const validators_1 = require("@ocj/validators");
exports.createRoomSchema = zod_1.z.object({
    problemId: zod_1.z.string().length(24, 'Invalid problem ID format').optional(),
    difficulty: zod_1.z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
    timeLimit: zod_1.z.number().int().min(100).max(10000).optional(),
    memoryLimit: zod_1.z.number().int().min(16).max(1024).optional(),
    maxParticipants: zod_1.z.number().int().min(2).max(10).optional(),
});
exports.joinRoomSchema = zod_1.z.object({
    roomCode: zod_1.z.string().regex(validators_1.ROOM_CODE_REGEX, 'Room code must be exactly 6 alphanumeric characters'),
});
exports.updateRoomSchema = exports.createRoomSchema.partial();
