"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const prisma_1 = require("../config/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
describe('Comments & Discussions Integration Tests', () => {
    let userToken;
    let userId;
    let targetId = '6659f8a3c8bf08be14023242'; // Simulated MongoDB ObjectId
    let createdCommentId;
    let createdReplyId;
    beforeAll(async () => {
        // 1. Clean up database
        await prisma_1.prisma.commentLike.deleteMany({});
        await prisma_1.prisma.comment.deleteMany({});
        await prisma_1.prisma.user.deleteMany({});
        // 2. Create user
        const hashedPwd = await bcrypt_1.default.hash('password123', 10);
        const user = await prisma_1.prisma.user.create({
            data: {
                username: 'commenter_user',
                email: 'commenter@test.com',
                password_hash: hashedPwd,
            },
        });
        userId = user.id;
        // 3. Login
        const loginRes = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/auth/login')
            .send({ email: 'commenter@test.com', password: 'password123' });
        userToken = loginRes.body.data?.accessToken;
    });
    afterAll(async () => {
        await prisma_1.prisma.commentLike.deleteMany({});
        await prisma_1.prisma.comment.deleteMany({});
        await prisma_1.prisma.user.deleteMany({});
    });
    it('should post a new comment successfully', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/comments')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
            targetId,
            targetType: 'PROBLEM',
            content: 'This is a test comment about the problem.',
        });
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('id');
        expect(res.body.data.content).toBe('This is a test comment about the problem.');
        expect(res.body.data.user_id).toBe(userId);
        createdCommentId = res.body.data.id;
    });
    it('should post a reply to the comment', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/comments')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
            targetId,
            targetType: 'PROBLEM',
            content: 'I agree with this comment!',
            parentId: createdCommentId,
        });
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.parent_id).toBe(createdCommentId);
        createdReplyId = res.body.data.id;
    });
    it('should get comments list with nested replies and user details', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .get('/api/v1/comments')
            .query({
            targetId,
            targetType: 'PROBLEM',
        });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.items.length).toBe(1);
        const topComment = res.body.data.items[0];
        expect(topComment.id).toBe(createdCommentId);
        expect(topComment.user.username).toBe('commenter_user');
        expect(topComment.replies.length).toBe(1);
        expect(topComment.replies[0].id).toBe(createdReplyId);
        expect(topComment.replies[0].user.username).toBe('commenter_user');
    });
    it('should toggle like on comment', async () => {
        // Like
        let res = await (0, supertest_1.default)(app_1.default)
            .post(`/api/v1/comments/${createdCommentId}/like`)
            .set('Authorization', `Bearer ${userToken}`);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.liked).toBe(true);
        // Get list to verify like count
        let listRes = await (0, supertest_1.default)(app_1.default)
            .get('/api/v1/comments')
            .query({ targetId, targetType: 'PROBLEM' });
        expect(listRes.body.data.items[0].likeCount).toBe(1);
        // Unlike
        res = await (0, supertest_1.default)(app_1.default)
            .post(`/api/v1/comments/${createdCommentId}/like`)
            .set('Authorization', `Bearer ${userToken}`);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.liked).toBe(false);
    });
    it('should update the comment content', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .put(`/api/v1/comments/${createdCommentId}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({
            content: 'This comment has been updated.',
        });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.content).toBe('This comment has been updated.');
    });
    it('should delete the comment', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .delete(`/api/v1/comments/${createdCommentId}`)
            .set('Authorization', `Bearer ${userToken}`);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });
});
