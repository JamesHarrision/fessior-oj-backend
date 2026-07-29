"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRoadmapSessionSchema = exports.generateRoadmapSchema = void 0;
const zod_1 = require("zod");
exports.generateRoadmapSchema = zod_1.z.object({
    body: zod_1.z.object({
        prompt: zod_1.z.string().min(1, 'Prompt is required'),
        startDate: zod_1.z.string().nullable().optional(),
    }),
});
exports.updateRoadmapSessionSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid session ID'),
    }),
    body: zod_1.z.object({
        date: zod_1.z.string().optional(),
        is_completed: zod_1.z.boolean().optional(),
    }).refine(data => Object.keys(data).length > 0, {
        message: "At least one field must be provided for update",
    }),
});
