"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateContestSchema = exports.createContestSchema = void 0;
const zod_1 = require("zod");
exports.createContestSchema = zod_1.z
    .object({
    title: zod_1.z.string().min(3, 'Title must be at least 3 characters'),
    description: zod_1.z.string().optional(),
    startTime: zod_1.z.string().datetime('Invalid start time format'),
    endTime: zod_1.z.string().datetime('Invalid end time format'),
    problems: zod_1.z
        .array(zod_1.z.object({
        problemId: zod_1.z.string().length(24, 'Invalid problem ID format'),
        points: zod_1.z.number().int().nonnegative().optional(),
        order: zod_1.z.number().int().nonnegative().optional(),
    }))
        .optional(),
})
    .refine((data) => new Date(data.endTime) > new Date(data.startTime), {
    message: 'End time must be after start time',
    path: ['endTime'],
});
exports.updateContestSchema = zod_1.z
    .object({
    title: zod_1.z.string().min(3).optional(),
    description: zod_1.z.string().optional(),
    startTime: zod_1.z.string().datetime().optional(),
    endTime: zod_1.z.string().datetime().optional(),
    problems: zod_1.z
        .array(zod_1.z.object({
        problemId: zod_1.z.string().length(24),
        points: zod_1.z.number().int().nonnegative().optional(),
        order: zod_1.z.number().int().nonnegative().optional(),
    }))
        .optional(),
})
    .refine((data) => {
    if (data.startTime && data.endTime) {
        return new Date(data.endTime) > new Date(data.startTime);
    }
    return true;
}, {
    message: 'End time must be after start time',
    path: ['endTime'],
});
