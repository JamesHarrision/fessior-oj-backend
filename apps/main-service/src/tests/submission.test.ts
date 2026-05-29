import request from 'supertest';
import app from '../app';
import { prisma } from '../config/prisma';
import { Problem } from '../models/problem.model';
import { Submission } from '../models/submission.model';
import bcrypt from 'bcrypt';

describe('Submission Integration Tests', () => {
  let userToken: string;
  let problemId: string;
  let submissionId: string;

  beforeAll(async () => {
    await prisma.problemIndex.deleteMany({});
    await prisma.user.deleteMany({});
    await Problem.deleteMany({});
    await Submission.deleteMany({});

    const hashedPwd = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
      data: {
        username: 'sub_user',
        email: 'user@sub.com',
        password_hash: hashedPwd,
      },
    });

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'user@sub.com', password: 'password123' });
    userToken = loginRes.body.data?.accessToken;

    // Create a problem in Mongo and SQL index
    const problem = new Problem({
      title: 'Two Sum',
      slug: 'two-sum',
      description: 'Solve two sum.',
      difficulty: 'EASY',
      timeLimit: 1000,
      memoryLimit: 256,
      starterCodes: {},
    });
    const savedProblem = await problem.save();
    problemId = savedProblem._id.toString();

    await prisma.problemIndex.create({
      data: {
        mongo_problem_id: problemId,
        title: 'Two Sum',
        slug: 'two-sum',
        difficulty: 'EASY',
      },
    });
  });

  afterAll(async () => {
    await prisma.problemIndex.deleteMany({});
    await prisma.user.deleteMany({});
    await Problem.deleteMany({});
    await Submission.deleteMany({});
  });

  it('should submit code successfully and queue it', async () => {
    const res = await request(app)
      .post('/api/v1/submissions')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        problemId: problemId,
        language: 'python',
        code: 'def solve(): pass',
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('Success');
    expect(res.body.data.status).toBe('PENDING');
    submissionId = res.body.data._id;
  });

  it('should fetch user submissions list', async () => {
    const res = await request(app)
      .get('/api/v1/submissions')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('Success');
    expect(res.body.data.items.length).toBeGreaterThan(0);
  });

  it('should fetch submission details', async () => {
    const res = await request(app)
      .get(`/api/v1/submissions/${submissionId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('Success');
    expect(res.body.data._id).toBe(submissionId);
  });
});
