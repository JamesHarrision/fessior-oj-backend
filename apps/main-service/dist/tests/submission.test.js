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
describe('Submission Integration Tests', () => {
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
                username: 'sub_user',
                email: 'user@sub.com',
                password_hash: hashedPwd,
            },
        });
        const loginRes = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/auth/login')
            .send({ email: 'user@sub.com', password: 'password123' });
        userToken = loginRes.body.data?.accessToken;
        // Create a problem in Mongo and SQL index
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
        await prisma_1.prisma.problemIndex.create({
            data: {
                mongo_problem_id: problemId,
                title: 'Two Sum',
                slug: 'two-sum',
                difficulty: 'EASY',
            },
        });
    });
    afterAll(async () => {
        await prisma_1.prisma.problemIndex.deleteMany({});
        await prisma_1.prisma.user.deleteMany({});
        await problem_model_1.Problem.deleteMany({});
        await submission_model_1.Submission.deleteMany({});
    });
    it('should submit code successfully and queue it', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/submissions')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
            problemId: problemId,
            language: 'python',
            code: 'def solve(): pass',
        });
        expect(res.status).toBe(201);
        expect(res.body.status).toBe('Success');
        expect(res.body.data.status).toBe('PENDING');
        submissionId = res.body.data._id;
    });
    it('should fetch user submissions list', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .get('/api/v1/submissions')
            .set('Authorization', `Bearer ${userToken}`);
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('Success');
        expect(res.body.data.items.length).toBeGreaterThan(0);
    });
    it('should fetch submission details', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .get(`/api/v1/submissions/${submissionId}`)
            .set('Authorization', `Bearer ${userToken}`);
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('Success');
        expect(res.body.data._id).toBe(submissionId);
    });
});
