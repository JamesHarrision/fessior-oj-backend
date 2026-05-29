import request from 'supertest';
import app from '../app';
import { prisma } from '../config/prisma';
import { Problem } from '../models/problem.model';
import { Submission } from '../models/submission.model';
import bcrypt from 'bcrypt';

describe('AI Feature Integration Tests', () => {
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
        username: 'ai_user',
        email: 'user@ai.com',
        password_hash: hashedPwd,
      },
    });

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'user@ai.com', password: 'password123' });
    userToken = loginRes.body.data?.accessToken;

    // Create a problem and a submission
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

    const submission = new Submission({
      userId: user.id,
      problemId: problemId,
      code: 'print(3)',
      language: 'python',
      status: 'ACCEPTED',
      testCasesPassed: 5,
      testCasesTotal: 5,
    });
    const savedSubmission = await submission.save();
    submissionId = savedSubmission._id.toString();
  });

  afterAll(async () => {
    await prisma.problemIndex.deleteMany({});
    await prisma.user.deleteMany({});
    await Problem.deleteMany({});
    await Submission.deleteMany({});
  });

  it('should generate personalized DSA roadmap', async () => {
    const res = await request(app)
      .post('/api/v1/ai/roadmap')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        skillLevel: 'BEGINNER',
        focusArea: 'Recursion',
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('Success');
    expect(res.body.data).toHaveProperty('title');
    expect(res.body.data).toHaveProperty('nodes');
  });

  it('should generate mock interview feedback for a submission', async () => {
    const res = await request(app)
      .post(`/api/v1/ai/feedback/${submissionId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('Success');
    expect(res.body.data).toHaveProperty('feedback');
    expect(res.body.data.feedback).toContain('AI Mock Interviewer Feedback');
  });
});
