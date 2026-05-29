import request from 'supertest';
import app from '../app';
import { prisma } from '../config/prisma';
import bcrypt from 'bcrypt';

describe('Social & Friends Integration Tests', () => {
  let user1Token: string;
  let user2Token: string;
  let user1Id: string;
  let user2Id: string;

  beforeAll(async () => {
    // 1. Clean up database
    await prisma.friendship.deleteMany({});
    await prisma.user.deleteMany({});

    // 2. Create users
    const hashedPwd = await bcrypt.hash('password123', 10);
    const user1 = await prisma.user.create({
      data: {
        username: 'user_one',
        email: 'user1@test.com',
        password_hash: hashedPwd,
      },
    });
    user1Id = user1.id;

    const user2 = await prisma.user.create({
      data: {
        username: 'user_two',
        email: 'user2@test.com',
        password_hash: hashedPwd,
      },
    });
    user2Id = user2.id;

    // 3. Login
    const login1 = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'user1@test.com', password: 'password123' });
    user1Token = login1.body.data?.accessToken;

    const login2 = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'user2@test.com', password: 'password123' });
    user2Token = login2.body.data?.accessToken;
  });

  afterAll(async () => {
    await prisma.friendship.deleteMany({});
    await prisma.user.deleteMany({});
  });

  it('should send a friend request successfully', async () => {
    const res = await request(app)
      .post('/api/v1/friends/request')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        receiverId: user2Id,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.sender_id).toBe(user1Id);
    expect(res.body.data.receiver_id).toBe(user2Id);
    expect(res.body.data.status).toBe('PENDING');
  });

  it('should retrieve pending requests', async () => {
    // Check receiver pending (incoming)
    const res2 = await request(app)
      .get('/api/v1/friends/requests')
      .set('Authorization', `Bearer ${user2Token}`);

    expect(res2.status).toBe(200);
    expect(res2.body.success).toBe(true);
    expect(res2.body.data.incoming.length).toBe(1);
    expect(res2.body.data.incoming[0].sender.id).toBe(user1Id);

    // Check sender pending (outgoing)
    const res1 = await request(app)
      .get('/api/v1/friends/requests')
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res1.status).toBe(200);
    expect(res1.body.success).toBe(true);
    expect(res1.body.data.outgoing.length).toBe(1);
    expect(res1.body.data.outgoing[0].receiver.id).toBe(user2Id);
  });

  it('should accept friend request', async () => {
    const res = await request(app)
      .post('/api/v1/friends/accept')
      .set('Authorization', `Bearer ${user2Token}`)
      .send({
        senderId: user1Id,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ACCEPTED');
  });

  it('should retrieve friends list with ELO and online status', async () => {
    const res = await request(app)
      .get('/api/v1/friends')
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.length).toBe(1);
    expect(res.body.data.items[0].id).toBe(user2Id);
    expect(res.body.data.items[0]).toHaveProperty('online');
  });

  it('should unfriend a friend', async () => {
    const res = await request(app)
      .delete(`/api/v1/friends/${user2Id}`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify friends list is now empty
    const listRes = await request(app)
      .get('/api/v1/friends')
      .set('Authorization', `Bearer ${user1Token}`);
    expect(listRes.body.data.items.length).toBe(0);
  });
});
