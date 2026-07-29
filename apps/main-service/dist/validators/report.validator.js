"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReportSchema = exports.createReportSchema = void 0;
const zod_1 = require("zod");
exports.createReportSchema = zod_1.z.object({
    type: zod_1.z.enum(['BUG', 'TYPO', 'CHEATING', 'OTHERS']),
    content: zod_1.z.string().min(5, 'Content must be at least 5 characters'),
    reportedUserId: zod_1.z.string().uuid('Invalid reported user ID').optional(),
    problemId: zod_1.z.string().min(1, 'Invalid problem ID').optional(),
});
exports.updateReportSchema = zod_1.z.object({
    status: zod_1.z.enum(['PENDING', 'RESOLVED', 'REJECTED']),
});
