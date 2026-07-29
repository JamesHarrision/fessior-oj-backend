"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const prisma_1 = require("../config/prisma");
const problem_model_1 = require("../models/problem.model");
const submission_model_1 = require("../models/submission.model");
const bcrypt_1 = __importDefault(require("bcrypt"));
describe('AI Feature Integration Tests', () => {
    let userToken;
    let problemId;
    let submissionId;
    beforeAll(async () => {
        await prisma_1.prisma.problemIndex.deleteMany({});
        await prisma_1.prisma.user.deleteMany({});
        await problem_model_1.Problem.deleteMany({});
        await submission_model_1.Submission.deleteMany({});
        const hashedPwd = await bcrypt_1.default.hash('password123', 10);
        const user = await prisma_1.prisma.user.create({
            data: {
                username: 'ai_user',
                email: 'user@ai.com',
                password_hash: hashedPwd,
            },
        });
        const loginRes = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/auth/login')
            .send({ email: 'user@ai.com', password: 'password123' });
        userToken = loginRes.body.data?.accessToken;
        // Create a problem and a submission
        const problem = new problem_model_1.Problem({
            title: 'Two Sum',
            slug: 'two-sum',
            description: 'Solve two sum.',
            difficulty: 'EASY',
            timeLimit: 1000,
            memoryLimit: 256,
            starterCodes: {},
        });
        const savedProblem = await problem.save();
        problemId = savedProblem._id.toString();
        const submission = new submission_model_1.Submission({
            userId: user.id,
            problemId: problemId,
            code: 'print(3)',
            language: 'python',
            status: 'ACCEPTED',
            testCasesPassed: 5,
            testCasesTotal: 5,
        });
        const savedSubmission = await submission.save();
        submissionId = savedSubmission._id.toString();
    });
    afterAll(async () => {
        await prisma_1.prisma.problemIndex.deleteMany({});
        await prisma_1.prisma.user.deleteMany({});
        await problem_model_1.Problem.deleteMany({});
        await submission_model_1.Submission.deleteMany({});
    });
    it('should generate personalized DSA roadmap', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/ai/roadmap')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
            skillLevel: 'BEGINNER',
            focusArea: 'Recursion',
        });
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('Success');
        expect(res.body.data).toHaveProperty('title');
        expect(res.body.data).toHaveProperty('nodes');
    }, 30000);
    it('should generate mock interview feedback for a submission', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post(`/api/v1/ai/feedback/${submissionId}`)
            .set('Authorization', `Bearer ${userToken}`);
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('Success');
        expect(res.body.data).toHaveProperty('feedback');
        expect(typeof res.body.data.feedback).toBe('string');
        expect(res.body.data.feedback.length).toBeGreaterThan(0);
    }, 30000);
});
