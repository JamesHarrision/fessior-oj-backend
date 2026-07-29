"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitCodeSchema = void 0;
const zod_1 = require("zod");
exports.submitCodeSchema = zod_1.z.object({
    problemId: zod_1.z.string().min(1, 'Problem ID or slug is required'),
    code: zod_1.z.string().min(10, 'Code must be at least 10 characters long'),
    language: zod_1.z.enum(['cpp', 'java', 'python']),
    matchId: zod_1.z.string().optional(),
    contestId: zod_1.z.string().optional(),
});
