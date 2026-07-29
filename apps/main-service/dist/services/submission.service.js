"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submissionService = exports.SubmissionService = void 0;
const problem_model_1 = require("../models/problem.model");
const submission_model_1 = require("../models/submission.model");
const testcase_model_1 = require("../models/testcase.model");
const queue_1 = require("../config/queue");
const errors_1 = require("@ocj/errors");
const mongoose_1 = __importDefault(require("mongoose"));
const executor_1 = require("@ocj/executor");
const constants_1 = require("@ocj/constants");
class SubmissionService {
    async submit(userId, data) {
        // 1. Find problem by Mongo ObjectId or slug
        let problem = null;
        if (mongoose_1.default.Types.ObjectId.isValid(data.problemId)) {
            problem = await problem_model_1.Problem.findById(data.problemId);
        }
        if (!problem) {
            problem = await problem_model_1.Problem.findOne({ slug: data.problemId });
        }
        if (!problem) {
            throw new errors_1.AppError('Problem not found', 404);
        }
        // 2. Create submission in MongoDB
        const submission = new submission_model_1.Submission({
            userId,
            problemId: problem._id,
            code: data.code,
            language: data.language,
            status: 'PENDING',
            testCasesPassed: 0,
            testCasesTotal: 0,
            matchId: data.matchId ?? null,
            contestId: data.contestId ?? null,
        });
        await submission.save();
        // 3. Add to BullMQ Queue
        await queue_1.submissionQueue.add('submission-job', {
            submissionId: submission._id.toString(),
            code: submission.code,
            language: submission.language,
            problemId: problem._id.toString(),
        });
        return submission;
    }
    async getSubmissionDetails(submissionId, userId, isAdmin = false) {
        if (!mongoose_1.default.Types.ObjectId.isValid(submissionId)) {
            throw new errors_1.AppError('Invalid submission ID format', 400);
        }
        const submission = await submission_model_1.Submission.findById(submissionId).populate('problemId', 'title slug difficulty');
        if (!submission) {
            throw new errors_1.AppError('Submission not found', 404);
        }
        // Security check: Only the author or an Admin can view details of a submission
        if (submission.userId !== userId && !isAdmin) {
            throw new errors_1.AppError('Forbidden: Access denied to this submission', 403);
        }
        return submission;
    }
    async getUserSubmissions(userId, filters) {
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const skip = (page - 1) * limit;
        const query = { userId };
        if (filters.problemId && mongoose_1.default.Types.ObjectId.isValid(filters.problemId)) {
            query.problemId = new mongoose_1.default.Types.ObjectId(filters.problemId);
        }
        const [total, items] = await Promise.all([
            submission_model_1.Submission.countDocuments(query),
            submission_model_1.Submission.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('problemId', 'title slug difficulty'),
        ]);
        return {
            total,
            page,
            limit,
            items,
        };
    }
    async runCode(data) {
        const rapidApiKey = process.env.RAPIDAPI_KEY || '';
        const rapidApiHost = process.env.RAPIDAPI_HOST || 'judge0-ce.p.rapidapi.com';
        const judge0Url = process.env.JUDGE0_URL || `https://${rapidApiHost}`;
        const enableLocalFallback = process.env.ENABLE_LOCAL_FALLBACK === 'true';
        const languageId = executor_1.LANGUAGE_IDS[data.language] || 71;
        let testcasesToRun = [];
        let problem = null;
        if (data.problemId) {
            // ── Has problem context: fetch problem + testcases ──
            if (mongoose_1.default.Types.ObjectId.isValid(data.problemId)) {
                problem = await problem_model_1.Problem.findById(data.problemId);
            }
            if (!problem) {
                problem = await problem_model_1.Problem.findOne({ slug: data.problemId });
            }
            if (!problem) {
                throw new errors_1.AppError('Problem not found', 404);
            }
            if (data.customInput !== undefined && data.customInput !== null) {
                testcasesToRun = [{ input: data.customInput, output: '', isExample: false }];
            }
            else {
                testcasesToRun = await testcase_model_1.Testcase.find({ problemId: problem._id, isExample: true });
                if (testcasesToRun.length === 0) {
                    testcasesToRun = [{ input: '', output: '', isExample: true }];
                }
            }
        }
        else {
            // ── No problem context (playground/sandbox): run with custom input or empty ──
            testcasesToRun = [
                { input: data.customInput ?? '', output: '', isExample: false },
            ];
        }
        const results = [];
        for (const tc of testcasesToRun) {
            const timeLimit = problem?.timeLimit ?? constants_1.DEFAULT_LIMITS.TIME_LIMIT_MS;
            const result = await (0, executor_1.executeTestCase)(data.code, languageId, tc.input, tc.output, timeLimit, {
                judge0Url,
                rapidApiKey,
                rapidApiHost,
                enableLocalFallback,
            });
            let finalStatus = result.status;
            // For custom input, we don't have expected output to compare, so any successful run without crashes is "ACCEPTED".
            if (data.customInput !== undefined && !['CE', 'RE', 'TLE'].includes(finalStatus)) {
                finalStatus = 'ACCEPTED';
            }
            results.push({
                status: finalStatus,
                input: tc.input,
                expectedOutput: tc.output,
                actualOutput: result.actualOutput,
                time: result.time,
                memory: result.memory,
                error: result.error,
            });
        }
        return results;
    }
}
exports.SubmissionService = SubmissionService;
exports.submissionService = new SubmissionService();
