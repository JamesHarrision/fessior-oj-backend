import request from 'supertest';
import app from '../app';
import { prisma } from '../config/prisma';
import { Problem } from '../models/problem.model';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

describe('Custom Rooms & Matches Integration Tests', () => {
  let creatorToken: string;
  let opponentToken: string;
  let creatorId: string;
  let opponentId: string;
  let testProblemId: string;
  let createdRoomId: string;
  let createdRoomCode: string;

  beforeAll(async () => {
    // 1. Clean up database
    await prisma.customRoom.deleteMany({});
    await prisma.match.deleteMany({});
    await prisma.problemIndex.deleteMany({});
    await prisma.user.deleteMany({});
    await Problem.deleteMany({});

    // 2. Create test users
    const hashedPwd = await bcrypt.hash('password123', 10);
    const creator = await prisma.user.create({
      data: {
        username: 'creator_user',
        email: 'creator@test.com',
        password_hash: hashedPwd,
      },
    });
    creatorId = creator.id;

    const opponent = await prisma.user.create({
      data: {
        username: 'opponent_user',
        email: 'opponent@test.com',
        password_hash: hashedPwd,
      },
    });
    opponentId = opponent.id;

    // 3. Login users to get tokens
    const creatorLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'creator@test.com', password: 'password123' });
    creatorToken = creatorLogin.body.data?.accessToken;

    const opponentLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'opponent@test.com', password: 'password123' });
    opponentToken = opponentLogin.body.data?.accessToken;

    // 4. Create a test problem
    const problem = new Problem({
      title: 'Sum of Two Numbers',
      slug: 'sum-of-two-numbers',
      description: 'Given two integers, return their sum.',
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
    await prisma.customRoom.deleteMany({});
    await prisma.match.deleteMany({});
    await prisma.problemIndex.deleteMany({});
    await prisma.user.deleteMany({});
    await Problem.deleteMany({});
  });

  it('should create a custom room successfully', async () => {
    const res = await request(app)
      .post('/api/v1/rooms/create')
      .set('Authorization', `Bearer ${creatorToken}`)
      .send({
        problemId: testProblemId,
        difficulty: 'EASY',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('room_code');
    expect(res.body.data.creator_id).toBe(creatorId);

    createdRoomId = res.body.data.id;
    createdRoomCode = res.body.data.room_code;
  });

  it('should get active rooms', async () => {
    const res = await request(app)
      .get('/api/v1/rooms/active')
      .set('Authorization', `Bearer ${opponentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].id).toBe(createdRoomId);
  });

  it('should get room details', async () => {
    const res = await request(app)
      .get(`/api/v1/rooms/${createdRoomId}`)
      .set('Authorization', `Bearer ${creatorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(createdRoomId);
  });

  it('should update room config', async () => {
    const res = await request(app)
      .put(`/api/v1/rooms/${createdRoomId}`)
      .set('Authorization', `Bearer ${creatorToken}`)
      .send({
        difficulty: 'MEDIUM',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.difficulty).toBe('MEDIUM');
  });

  it('should join custom room and start match', async () => {
    const res = await request(app)
      .post('/api/v1/rooms/join')
      .set('Authorization', `Bearer ${opponentToken}`)
      .send({
        roomCode: createdRoomCode,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.room.opponent_id).toBe(opponentId);
    expect(res.body.data.room.status).toBe('PLAYING');
    expect(res.body.data).toHaveProperty('matchId');

    const matchId = res.body.data.matchId;

    // Check Match history for user
    const historyRes = await request(app)
      .get('/api/v1/matches/history')
      .set('Authorization', `Bearer ${creatorToken}`);

    expect(historyRes.status).toBe(200);
    expect(historyRes.body.success).toBe(true);
    expect(historyRes.body.data.items.length).toBeGreaterThan(0);
    expect(historyRes.body.data.items[0].id).toBe(matchId);

    // Get match details
    const detailRes = await request(app)
      .get(`/api/v1/matches/${matchId}`)
      .set('Authorization', `Bearer ${opponentToken}`);

    expect(detailRes.status).toBe(200);
    expect(detailRes.body.success).toBe(true);
    expect(detailRes.body.data.id).toBe(matchId);
  });
});
