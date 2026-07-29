"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const prisma_1 = require("../config/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
describe('Reports & Feedback Integration Tests', () => {
    let adminToken;
    let userToken;
    let userId;
    let reportId;
    const problemId = '6659f8a3c8bf08be14023242'; // Simulated MongoDB problem ID
    beforeAll(async () => {
        // 1. Clean up database
        await prisma_1.prisma.report.deleteMany({});
        await prisma_1.prisma.user.deleteMany({});
        // 2. Create users
        const hashedPwd = await bcrypt_1.default.hash('password123', 10);
        const admin = await prisma_1.prisma.user.create({
            data: {
                username: 'report_admin',
                email: 'admin@report.com',
                password_hash: hashedPwd,
                role: 'ADMIN',
            },
        });
        const user = await prisma_1.prisma.user.create({
            data: {
                username: 'reporter_user',
                email: 'user@report.com',
                password_hash: hashedPwd,
                role: 'USER',
            },
        });
        userId = user.id;
        // 3. Login
        const adminLogin = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/auth/login')
            .send({ email: 'admin@report.com', password: 'password123' });
        adminToken = adminLogin.body.data?.accessToken;
        const userLogin = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/auth/login')
            .send({ email: 'user@report.com', password: 'password123' });
        userToken = userLogin.body.data?.accessToken;
    });
    afterAll(async () => {
        await prisma_1.prisma.report.deleteMany({});
        await prisma_1.prisma.user.deleteMany({});
    });
    it('should allow user to submit a report', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/reports')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
            type: 'BUG',
            content: 'The test case #3 has incorrect expected output.',
            problemId,
        });
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('id');
        expect(res.body.data.user_id).toBe(userId);
        expect(res.body.data.type).toBe('BUG');
        expect(res.body.data.content).toBe('The test case #3 has incorrect expected output.');
        expect(res.body.data.problem_id).toBe(problemId);
        expect(res.body.data.status).toBe('PENDING');
        reportId = res.body.data.id;
    });
    it('should allow user to retrieve their submitted reports', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .get('/api/v1/reports')
            .set('Authorization', `Bearer ${userToken}`);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.items.length).toBe(1);
        expect(res.body.data.items[0].id).toBe(reportId);
    });
    it('should allow admin to retrieve all reports', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .get('/api/v1/reports')
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.items.length).toBe(1);
    });
    it('should allow admin to update report status to RESOLVED', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .put(`/api/v1/reports/${reportId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            status: 'RESOLVED',
        });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.status).toBe('RESOLVED');
    });
});
