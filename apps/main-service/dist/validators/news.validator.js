"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNewsSchema = void 0;
const zod_1 = require("zod");
exports.createNewsSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required').max(255, 'Title too long'),
    content: zod_1.z.string().min(1, 'Content is required'),
});
