import request from 'supertest';
import app from '../app';
import { prisma } from '../config/prisma';
import { Problem } from '../models/problem.model';
import { Submission } from '../models/submission.model';
import bcrypt from 'bcrypt';

describe('Contests Integration Tests', () => {
  let adminToken: string;
  let userToken: string;
  let userId: string;
  let contestId: string;
  let testProblemId: string;

  beforeAll(async () => {
    // 1. Clean up databases
    await prisma.contestRegistration.deleteMany({});
    await prisma.contestProblem.deleteMany({});
    await prisma.contest.deleteMany({});
    await prisma.user.deleteMany({});
    await Problem.deleteMany({});
    await Submission.deleteMany({});

    // 2. Create users
    const hashedPwd = await bcrypt.hash('password123', 10);
    const admin = await prisma.user.create({
      data: {
        username: 'admin_user',
        email: 'admin@test.com',
        password_hash: hashedPwd,
        role: 'ADMIN',
      },
    });

    const user = await prisma.user.create({
      data: {
        username: 'normal_user',
        email: 'user@test.com',
        password_hash: hashedPwd,
        role: 'USER',
      },
    });
    userId = user.id;

    // 3. Login
    const adminLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@test.com', password: 'password123' });
    adminToken = adminLogin.body.data?.accessToken;

    const userLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'user@test.com', password: 'password123' });
    userToken = userLogin.body.data?.accessToken;

    // 4. Create test problem
    const problem = new Problem({
      title: 'Problem A',
      slug: 'problem-a',
      description: 'Problem A desc',
      difficulty: 'EASY',
    });
    await problem.save();
    testProblemId = problem._id.toString();

    await prisma.problemIndex.create({
      data: {
        mongo_problem_id: testProblemId,
        title: problem.title,
        slug: problem.slug,
        difficulty: 'EASY',
      },
    });
  });

  afterAll(async () => {
    await prisma.contestRegistration.deleteMany({});
    await prisma.contestProblem.deleteMany({});
    await prisma.contest.deleteMany({});
    await prisma.user.deleteMany({});
    await Problem.deleteMany({});
    await Submission.deleteMany({});
  });

  it('should allow admin to create a contest', async () => {
    const startTime = new Date();
    startTime.setMinutes(startTime.getMinutes() - 5); // Started 5 mins ago
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + 2); // Ends in 2 hours

    const res = await request(app)
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
    const res = await request(app).get('/api/v1/contests');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('should allow user to register for the contest', async () => {
    const res = await request(app)
      .post(`/api/v1/contests/${contestId}/register`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should retrieve contest problems for registered user', async () => {
    const res = await request(app)
      .get(`/api/v1/contests/${contestId}/problems`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].id).toBe(testProblemId);
  });

  it('should view contest leaderboard with user standings', async () => {
    // 1. Submit an accepted solution
    const submission = new Submission({
      userId,
      problemId: testProblemId,
      code: 'print("hello")',
      language: 'python',
      status: 'ACCEPTED',
      contestId,
    });
    await submission.save();

    // 2. Fetch Leaderboard
    const res = await request(app).get(`/api/v1/contests/${contestId}/leaderboard`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].username).toBe('normal_user');
    expect(res.body.data[0].score).toBe(100);
  });
});
