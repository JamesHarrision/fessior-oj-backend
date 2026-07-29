"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestcaseSchema = exports.updateProblemSchema = exports.createProblemSchema = void 0;
const zod_1 = require("zod");
exports.createProblemSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, 'Title must be at least 3 characters').max(255),
    description: zod_1.z.string().min(10, 'Description must be at least 10 characters'),
    difficulty: zod_1.z.enum(['EASY', 'MEDIUM', 'HARD']),
    timeLimit: zod_1.z.number().int().min(100).max(10000).default(2000),
    memoryLimit: zod_1.z.number().int().min(16).max(1024).default(256),
    starterCodes: zod_1.z.object({
        cpp: zod_1.z.string().optional().default(''),
        java: zod_1.z.string().optional().default(''),
        python: zod_1.z.string().optional().default(''),
    }).default({ cpp: '', java: '', python: '' }),
    editorialMarkdown: zod_1.z.string().optional(),
    editorialVideoUrl: zod_1.z.string().url('Invalid editorial video URL').optional().or(zod_1.z.literal('')),
    tags: zod_1.z.array(zod_1.z.string().uuid('Invalid tag ID format')).optional().default([]),
});
exports.updateProblemSchema = exports.createProblemSchema.partial();
exports.createTestcaseSchema = zod_1.z.object({
    isExample: zod_1.z.boolean().default(false),
    input: zod_1.z.string(),
    output: zod_1.z.string(),
});
