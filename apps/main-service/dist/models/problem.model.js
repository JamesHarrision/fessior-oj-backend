"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Problem = void 0;
const mongoose_1 = require("mongoose");
const constants_1 = require("@ocj/constants");
const ProblemSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    difficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD'], required: true },
    timeLimit: { type: Number, default: constants_1.DEFAULT_LIMITS.TIME_LIMIT_MS },
    memoryLimit: { type: Number, default: constants_1.DEFAULT_LIMITS.MEMORY_LIMIT_MB },
    starterCodes: {
        cpp: { type: String, default: '' },
        java: { type: String, default: '' },
        python: { type: String, default: '' },
    },
    editorialMarkdown: { type: String },
    editorialVideoUrl: { type: String },
}, { timestamps: true });
exports.Problem = (0, mongoose_1.model)('Problem', ProblemSchema);
