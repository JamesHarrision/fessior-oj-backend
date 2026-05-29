import request from 'supertest';
import app from '../app';
import { prisma } from '../config/prisma';
import bcrypt from 'bcrypt';

describe('Comments & Discussions Integration Tests', () => {
  let userToken: string;
  let userId: string;
  let targetId = '6659f8a3c8bf08be14023242'; // Simulated MongoDB ObjectId
  let createdCommentId: string;
  let createdReplyId: string;

  beforeAll(async () => {
    // 1. Clean up database
    await prisma.commentLike.deleteMany({});
    await prisma.comment.deleteMany({});
    await prisma.user.deleteMany({});

    // 2. Create user
    const hashedPwd = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
      data: {
        username: 'commenter_user',
        email: 'commenter@test.com',
        password_hash: hashedPwd,
      },
    });
    userId = user.id;

    // 3. Login
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'commenter@test.com', password: 'password123' });
    userToken = loginRes.body.data?.accessToken;
  });

  afterAll(async () => {
    await prisma.commentLike.deleteMany({});
    await prisma.comment.deleteMany({});
    await prisma.user.deleteMany({});
  });

  it('should post a new comment successfully', async () => {
    const res = await request(app)
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
    const res = await request(app)
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
    const res = await request(app)
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
    let res = await request(app)
      .post(`/api/v1/comments/${createdCommentId}/like`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.liked).toBe(true);

    // Get list to verify like count
    let listRes = await request(app)
      .get('/api/v1/comments')
      .query({ targetId, targetType: 'PROBLEM' });
    expect(listRes.body.data.items[0].likeCount).toBe(1);

    // Unlike
    res = await request(app)
      .post(`/api/v1/comments/${createdCommentId}/like`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.liked).toBe(false);
  });

  it('should update the comment content', async () => {
    const res = await request(app)
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
    const res = await request(app)
      .delete(`/api/v1/comments/${createdCommentId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
