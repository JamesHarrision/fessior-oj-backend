"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const prisma_1 = require("../config/prisma");
const problem_model_1 = require("../models/problem.model");
const bcrypt_1 = __importDefault(require("bcrypt"));
describe('Problem & Tag Integration Tests', () => {
    let adminToken;
    let userToken;
    let tagId;
    let problemId;
    let problemSlug;
    let testcaseId;
    beforeAll(async () => {
        // 1. Clean up databases
        await prisma_1.prisma.problemIndex.deleteMany({});
        await prisma_1.prisma.tag.deleteMany({});
        await prisma_1.prisma.user.deleteMany({});
        await problem_model_1.Problem.deleteMany({});
        // 2. Create users
        const hashedPwd = await bcrypt_1.default.hash('password123', 10);
        await prisma_1.prisma.user.create({
            data: {
                username: 'prob_admin',
                email: 'admin@prob.com',
                password_hash: hashedPwd,
                role: 'ADMIN',
            },
        });
        await prisma_1.prisma.user.create({
            data: {
                username: 'prob_user',
                email: 'user@prob.com',
                password_hash: hashedPwd,
                role: 'USER',
            },
        });
        // 3. Login
        const adminLogin = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/auth/login')
            .send({ email: 'admin@prob.com', password: 'password123' });
        adminToken = adminLogin.body.data?.accessToken;
        const userLogin = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/auth/login')
            .send({ email: 'user@prob.com', password: 'password123' });
        userToken = userLogin.body.data?.accessToken;
    });
    afterAll(async () => {
        await prisma_1.prisma.problemIndex.deleteMany({});
        await prisma_1.prisma.tag.deleteMany({});
        await prisma_1.prisma.user.deleteMany({});
        await problem_model_1.Problem.deleteMany({});
    });
    it('should allow admin to create tag and anyone to list tags', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/problems/tags')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            name: 'Dynamic Programming',
            color: '#FF0000',
        });
        expect(res.status).toBe(201);
        expect(res.body.status).toBe('Success');
        tagId = res.body.data.id;
        const listRes = await (0, supertest_1.default)(app_1.default).get('/api/v1/problems/tags');
        expect(listRes.status).toBe(200);
        expect(listRes.body.status).toBe('Success');
        expect(listRes.body.data.length).toBeGreaterThan(0);
    });
    it('should allow admin to create, get, list, and update a problem', async () => {
        // 1. Create Problem
        const createRes = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/problems')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            title: 'Fibonacci Number',
            description: 'Calculate the nth fibonacci number.',
            difficulty: 'EASY',
            timeLimit: 1000,
            memoryLimit: 128,
            tags: [tagId],
        });
        expect(createRes.status).toBe(201);
        expect(createRes.body.status).toBe('Success');
        problemId = createRes.body.data._id;
        problemSlug = createRes.body.data.slug;
        // 2. Get Problem by Slug
        const getRes = await (0, supertest_1.default)(app_1.default).get(`/api/v1/problems/${problemSlug}`);
        expect(getRes.status).toBe(200);
        expect(getRes.body.status).toBe('Success');
        expect(getRes.body.data.title).toBe('Fibonacci Number');
        // 3. List Problems
        const listRes = await (0, supertest_1.default)(app_1.default).get('/api/v1/problems');
        expect(listRes.status).toBe(200);
        expect(listRes.body.status).toBe('Success');
        expect(listRes.body.data.items.length).toBeGreaterThan(0);
        // 4. Update Problem
        const updateRes = await (0, supertest_1.default)(app_1.default)
            .put(`/api/v1/problems/${problemId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            title: 'Fibonacci Number Updated',
            description: 'Calculate the nth fibonacci number (updated description).',
            difficulty: 'EASY',
            timeLimit: 1000,
            memoryLimit: 128,
            tags: [tagId],
        });
        expect(updateRes.status).toBe(200);
        expect(updateRes.body.status).toBe('Success');
    });
    it('should allow admin to add testcase, user to get testcase, and admin to delete testcase', async () => {
        // 1. Add Testcase
        const addRes = await (0, supertest_1.default)(app_1.default)
            .post(`/api/v1/problems/${problemId}/testcases`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            input: '5',
            output: '5',
            isExample: true,
        });
        expect(addRes.status).toBe(201);
        expect(addRes.body.status).toBe('Success');
        testcaseId = addRes.body.data._id;
        // 2. Get Testcases (User)
        const getRes = await (0, supertest_1.default)(app_1.default)
            .get(`/api/v1/problems/${problemId}/testcases`)
            .set('Authorization', `Bearer ${userToken}`);
        expect(getRes.status).toBe(200);
        expect(getRes.body.status).toBe('Success');
        expect(getRes.body.data.length).toBeGreaterThan(0);
        // 3. Delete Testcase
        const delRes = await (0, supertest_1.default)(app_1.default)
            .delete(`/api/v1/problems/testcases/${testcaseId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(delRes.status).toBe(200);
        expect(delRes.body.status).toBe('Success');
    });
});
