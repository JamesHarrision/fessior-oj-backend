import request from 'supertest';
import app from '../app';
import { prisma } from '../config/prisma';
import { Problem } from '../models/problem.model';
import bcrypt from 'bcrypt';

describe('Problem & Tag Integration Tests', () => {
  let adminToken: string;
  let userToken: string;
  let tagId: string;
  let problemId: string;
  let problemSlug: string;
  let testcaseId: string;

  beforeAll(async () => {
    // 1. Clean up databases
    await prisma.problemIndex.deleteMany({});
    await prisma.tag.deleteMany({});
    await prisma.user.deleteMany({});
    await Problem.deleteMany({});

    // 2. Create users
    const hashedPwd = await bcrypt.hash('password123', 10);
    await prisma.user.create({
      data: {
        username: 'prob_admin',
        email: 'admin@prob.com',
        password_hash: hashedPwd,
        role: 'ADMIN',
      },
    });

    await prisma.user.create({
      data: {
        username: 'prob_user',
        email: 'user@prob.com',
        password_hash: hashedPwd,
        role: 'USER',
      },
    });

    // 3. Login
    const adminLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@prob.com', password: 'password123' });
    adminToken = adminLogin.body.data?.accessToken;

    const userLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'user@prob.com', password: 'password123' });
    userToken = userLogin.body.data?.accessToken;
  });

  afterAll(async () => {
    await prisma.problemIndex.deleteMany({});
    await prisma.tag.deleteMany({});
    await prisma.user.deleteMany({});
    await Problem.deleteMany({});
  });

  it('should allow admin to create tag and anyone to list tags', async () => {
    const res = await request(app)
      .post('/api/v1/problems/tags')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Dynamic Programming',
        color: '#FF0000',
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('Success');
    tagId = res.body.data.id;

    const listRes = await request(app).get('/api/v1/problems/tags');
    expect(listRes.status).toBe(200);
    expect(listRes.body.status).toBe('Success');
    expect(listRes.body.data.length).toBeGreaterThan(0);
  });

  it('should allow admin to create, get, list, and update a problem', async () => {
    // 1. Create Problem
    const createRes = await request(app)
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
    const getRes = await request(app).get(`/api/v1/problems/${problemSlug}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.status).toBe('Success');
    expect(getRes.body.data.title).toBe('Fibonacci Number');

    // 3. List Problems
    const listRes = await request(app).get('/api/v1/problems');
    expect(listRes.status).toBe(200);
    expect(listRes.body.status).toBe('Success');
    expect(listRes.body.data.items.length).toBeGreaterThan(0);

    // 4. Update Problem
    const updateRes = await request(app)
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
    const addRes = await request(app)
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
    const getRes = await request(app)
      .get(`/api/v1/problems/${problemId}/testcases`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.status).toBe('Success');
    expect(getRes.body.data.length).toBeGreaterThan(0);

    // 3. Delete Testcase
    const delRes = await request(app)
      .delete(`/api/v1/problems/testcases/${testcaseId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(delRes.status).toBe(200);
    expect(delRes.body.status).toBe('Success');
  });
});
