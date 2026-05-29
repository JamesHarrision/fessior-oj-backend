import request from 'supertest';
import app from '../app';
import { prisma } from '../config/prisma';
import bcrypt from 'bcrypt';

describe('Reports & Feedback Integration Tests', () => {
  let adminToken: string;
  let userToken: string;
  let userId: string;
  let reportId: string;
  const problemId = '6659f8a3c8bf08be14023242'; // Simulated MongoDB problem ID

  beforeAll(async () => {
    // 1. Clean up database
    await prisma.report.deleteMany({});
    await prisma.user.deleteMany({});

    // 2. Create users
    const hashedPwd = await bcrypt.hash('password123', 10);
    const admin = await prisma.user.create({
      data: {
        username: 'report_admin',
        email: 'admin@report.com',
        password_hash: hashedPwd,
        role: 'ADMIN',
      },
    });

    const user = await prisma.user.create({
      data: {
        username: 'reporter_user',
        email: 'user@report.com',
        password_hash: hashedPwd,
        role: 'USER',
      },
    });
    userId = user.id;

    // 3. Login
    const adminLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@report.com', password: 'password123' });
    adminToken = adminLogin.body.data?.accessToken;

    const userLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'user@report.com', password: 'password123' });
    userToken = userLogin.body.data?.accessToken;
  });

  afterAll(async () => {
    await prisma.report.deleteMany({});
    await prisma.user.deleteMany({});
  });

  it('should allow user to submit a report', async () => {
    const res = await request(app)
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
    const res = await request(app)
      .get('/api/v1/reports')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.length).toBe(1);
    expect(res.body.data.items[0].id).toBe(reportId);
  });

  it('should allow admin to retrieve all reports', async () => {
    const res = await request(app)
      .get('/api/v1/reports')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.length).toBe(1);
  });

  it('should allow admin to update report status to RESOLVED', async () => {
    const res = await request(app)
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
