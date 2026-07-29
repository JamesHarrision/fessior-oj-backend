"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Submission = void 0;
const mongoose_1 = require("mongoose");
const SubmissionSchema = new mongoose_1.Schema({
    userId: { type: String, required: true, index: true },
    problemId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Problem', required: true, index: true },
    code: { type: String, required: true },
    language: { type: String, enum: ['cpp', 'java', 'python'], required: true },
    status: {
        type: String,
        enum: ['PENDING', 'PROCESSING', 'ACCEPTED', 'WA', 'TLE', 'MLE', 'RE', 'CE'],
        default: 'PENDING',
        index: true,
    },
    executionTime: { type: Number },
    memoryUsed: { type: Number },
    errorMessage: { type: String },
    testCasesPassed: { type: Number, default: 0 },
    testCasesTotal: { type: Number, default: 0 },
    aiFeedback: { type: String },
    matchId: { type: String, default: null, index: true },
    contestId: { type: String, index: true },
}, { timestamps: true });
exports.Submission = (0, mongoose_1.model)('Submission', SubmissionSchema);
