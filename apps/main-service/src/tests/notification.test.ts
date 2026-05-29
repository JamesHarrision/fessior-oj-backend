import request from 'supertest';
import app from '../app';
import { prisma } from '../config/prisma';
import bcrypt from 'bcrypt';

describe('Notifications Integration Tests', () => {
  let adminToken: string;
  let userToken: string;
  let userId: string;
  let notificationId: string;

  beforeAll(async () => {
    // 1. Clean up database
    await prisma.notification.deleteMany({});
    await prisma.user.deleteMany({});

    // 2. Create users
    const hashedPwd = await bcrypt.hash('password123', 10);
    const admin = await prisma.user.create({
      data: {
        username: 'notify_admin',
        email: 'admin@notify.com',
        password_hash: hashedPwd,
        role: 'ADMIN',
      },
    });

    const user = await prisma.user.create({
      data: {
        username: 'notify_recipient',
        email: 'user@notify.com',
        password_hash: hashedPwd,
        role: 'USER',
      },
    });
    userId = user.id;

    // 3. Login
    const adminLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@notify.com', password: 'password123' });
    adminToken = adminLogin.body.data?.accessToken;

    const userLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'user@notify.com', password: 'password123' });
    userToken = userLogin.body.data?.accessToken;
  });

  afterAll(async () => {
    await prisma.notification.deleteMany({});
    await prisma.user.deleteMany({});
  });

  it('should allow admin to create a notification for a user', async () => {
    const res = await request(app)
      .post('/api/v1/notifications')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        userId,
        title: 'Welcome!',
        content: 'Welcome to Online Code Judge.',
        type: 'SYSTEM',
        data: JSON.stringify({ welcome: true }),
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.title).toBe('Welcome!');
    expect(res.body.data.user_id).toBe(userId);

    notificationId = res.body.data.id;
  });

  it('should retrieve recipient notifications list', async () => {
    const res = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.length).toBe(1);
    expect(res.body.data.items[0].id).toBe(notificationId);
    expect(res.body.data.items[0].is_read).toBe(false);
  });

  it('should mark notifications as read', async () => {
    const res = await request(app)
      .put('/api/v1/notifications/read')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        notificationIds: [notificationId],
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify it is read
    const checkRes = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${userToken}`);
    expect(checkRes.body.data.items[0].is_read).toBe(true);
  });

  it('should delete a notification', async () => {
    const res = await request(app)
      .delete(`/api/v1/notifications/${notificationId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify list is empty
    const checkRes = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${userToken}`);
    expect(checkRes.body.data.items.length).toBe(0);
  });
});
