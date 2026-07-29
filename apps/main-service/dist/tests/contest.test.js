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
describe('Contests Integration Tests', () => {
    let adminToken;
    let userToken;
    let userId;
    let contestId;
    let testProblemId;
    beforeAll(async () => {
        // 1. Clean up databases
        await prisma_1.prisma.contestRegistration.deleteMany({});
        await prisma_1.prisma.contestProblem.deleteMany({});
        await prisma_1.prisma.contest.deleteMany({});
        await prisma_1.prisma.user.deleteMany({});
        await problem_model_1.Problem.deleteMany({});
        await submission_model_1.Submission.deleteMany({});
        // 2. Create users
        const hashedPwd = await bcrypt_1.default.hash('password123', 10);
        const admin = await prisma_1.prisma.user.create({
            data: {
                username: 'admin_user',
                email: 'admin@test.com',
                password_hash: hashedPwd,
                role: 'ADMIN',
            },
        });
        const user = await prisma_1.prisma.user.create({
            data: {
                username: 'normal_user',
                email: 'user@test.com',
                password_hash: hashedPwd,
                role: 'USER',
            },
        });
        userId = user.id;
        // 3. Login
        const adminLogin = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/auth/login')
            .send({ email: 'admin@test.com', password: 'password123' });
        adminToken = adminLogin.body.data?.accessToken;
        const userLogin = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/auth/login')
            .send({ email: 'user@test.com', password: 'password123' });
        userToken = userLogin.body.data?.accessToken;
        // 4. Create test problem
        const problem = new problem_model_1.Problem({
            title: 'Problem A',
            slug: 'problem-a',
            description: 'Problem A desc',
            difficulty: 'EASY',
        });
        await problem.save();
        testProblemId = problem._id.toString();
        await prisma_1.prisma.problemIndex.create({
            data: {
                mongo_problem_id: testProblemId,
                title: problem.title,
                slug: problem.slug,
                difficulty: 'EASY',
            },
        });
    });
    afterAll(async () => {
        await prisma_1.prisma.contestRegistration.deleteMany({});
        await prisma_1.prisma.contestProblem.deleteMany({});
        await prisma_1.prisma.contest.deleteMany({});
        await prisma_1.prisma.user.deleteMany({});
        await problem_model_1.Problem.deleteMany({});
        await submission_model_1.Submission.deleteMany({});
    });
    it('should allow admin to create a contest', async () => {
        const startTime = new Date();
        startTime.setMinutes(startTime.getMinutes() - 5); // Started 5 mins ago
        const endTime = new Date();
        endTime.setHours(endTime.getHours() + 2); // Ends in 2 hours
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/contests')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            title: 'Weekly Contest #1',
            description: 'First weekly programming contest',
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            problems: [
                {
                    problemId: testProblemId,
                    points: 100,
                    order: 1,
                },
            ],
        });
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('id');
        expect(res.body.data.title).toBe('Weekly Contest #1');
        expect(res.body.data.problems.length).toBe(1);
        contestId = res.body.data.id;
    });
    it('should list contests', async () => {
        const res = await (0, supertest_1.default)(app_1.default).get('/api/v1/contests');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
    });
    it('should allow user to register for the contest', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post(`/api/v1/contests/${contestId}/register`)
            .set('Authorization', `Bearer ${userToken}`);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });
    it('should retrieve contest problems for registered user', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .get(`/api/v1/contests/${contestId}/problems`)
            .set('Authorization', `Bearer ${userToken}`);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].id).toBe(testProblemId);
    });
    it('should view contest leaderboard with user standings', async () => {
        // 1. Submit an accepted solution
        const submission = new submission_model_1.Submission({
            userId,
            problemId: testProblemId,
            code: 'print("hello")',
            language: 'python',
            status: 'ACCEPTED',
            contestId,
        });
        await submission.save();
        // 2. Fetch Leaderboard
        const res = await (0, supertest_1.default)(app_1.default).get(`/api/v1/contests/${contestId}/leaderboard`);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].username).toBe('normal_user');
        expect(res.body.data[0].score).toBe(100);
    });
});
