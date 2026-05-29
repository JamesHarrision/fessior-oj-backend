import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt.util';
import { prisma } from '../config/prisma';
import { Problem } from '../models/problem.model';
import { redis } from '../config/redis';
import Redis from 'ioredis';
import { MatchStatus, PlayerMatchStatus } from '@prisma/client';

interface QueuePlayer {
  userId: string;
  socketId: string;
  username: string;
  elo: number;
}

const matchmakingQueue: QueuePlayer[] = [];
export let io: Server | null = null;

// Initialize a separate Redis client for Pub/Sub subscription
const pubSubClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
});

export const initSocket = (socketIoServer: Server) => {
  io = socketIoServer;

  // Authentication Middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        return next(new Error('Authentication error: Token is required'));
      }
      const decoded = verifyAccessToken(token as string);
      socket.data.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const connUserId = socket.data.user.userId;
    console.log(`Socket connected: ${socket.id} (User: ${connUserId})`);
    redis.sadd('online_users', connUserId).catch(err => console.error(err));
    socket.join(`user:${connUserId}`);

    // Matchmaking Join Queue
    socket.on('join-queue', async () => {
      try {
        const userId = socket.data.user.userId;
        
        // Fetch user ELO from MySQL
        const user = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          socket.emit('error', { message: 'User not found' });
          return;
        }

        // Check if already in queue
        const alreadyInQueue = matchmakingQueue.find((p) => p.userId === userId);
        if (alreadyInQueue) {
          socket.emit('queue-status', { message: 'Already in queue' });
          return;
        }

        const player: QueuePlayer = {
          userId,
          socketId: socket.id,
          username: user.username,
          elo: user.elo_rating,
        };

        matchmakingQueue.push(player);
        console.log(`Player joined queue: ${player.username} (ELO: ${player.elo})`);
        socket.emit('queue-status', { status: 'QUEUED', elo: player.elo });

        // Try matchmaking
        await tryMatchmaking();
      } catch (err) {
        console.error('Error joining matchmaking queue:', err);
        socket.emit('error', { message: 'Failed to join matchmaking queue' });
      }
    });

    // Leave Queue
    socket.on('leave-queue', () => {
      removeUserFromQueue(socket.data.user.userId);
      socket.emit('queue-status', { status: 'IDLE' });
    });

    // Handle Forfeit/Leave Match
    socket.on('forfeit-match', async (data: { matchId: string }) => {
      try {
        const userId = socket.data.user.userId;
        await handleForfeit(data.matchId, userId);
      } catch (err) {
        console.error('Error forfeiting match:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      removeUserFromQueue(socket.data.user.userId);
      redis.srem('online_users', socket.data.user.userId).catch(err => console.error(err));
    });
  });

  // Subscribe to Redis Pub/Sub submission updates
  pubSubClient.subscribe('submission-updates', (err) => {
    if (err) {
      console.error('Failed to subscribe to submission-updates channel:', err);
    } else {
      console.log('Subscribed to submission-updates channel successfully');
    }
  });

  pubSubClient.on('message', async (channel, message) => {
    if (channel === 'submission-updates') {
      try {
        const data = JSON.parse(message);
        // data: { submissionId, userId, problemId, status, testCasesPassed, testCasesTotal }
        await handleSubmissionUpdate(data);
      } catch (err) {
        console.error('Error parsing submission update message:', err);
      }
    }
  });
};

const removeUserFromQueue = (userId: string) => {
  const index = matchmakingQueue.findIndex((p) => p.userId === userId);
  if (index !== -1) {
    console.log(`Removing user from queue: ${matchmakingQueue[index].username}`);
    matchmakingQueue.splice(index, 1);
  }
};

const tryMatchmaking = async () => {
  if (matchmakingQueue.length < 2) return;

  // Matchmaking Algorithm: Find two players with closest ELO ratings
  // Sort queue by ELO rating
  matchmakingQueue.sort((a, b) => a.elo - b.elo);

  let bestDiff = Infinity;
  let matchIndex = -1;

  for (let i = 0; i < matchmakingQueue.length - 1; i++) {
    const diff = Math.abs(matchmakingQueue[i].elo - matchmakingQueue[i + 1].elo);
    if (diff < bestDiff) {
      bestDiff = diff;
      matchIndex = i;
    }
  }

  if (matchIndex !== -1) {
    const player1 = matchmakingQueue[matchIndex];
    const player2 = matchmakingQueue[matchIndex + 1];

    // Remove them from matchmaking queue
    matchmakingQueue.splice(matchIndex, 2);

    await startMatch(player1, player2);
  }
};

const startMatch = async (p1: QueuePlayer, p2: QueuePlayer) => {
  try {
    // 1. Fetch a random Problem from MongoDB
    const problemsCount = await Problem.countDocuments();
    if (problemsCount === 0) {
      throw new Error('No problems found in database to match');
    }
    const randomIndex = Math.floor(Math.random() * problemsCount);
    const problem = await Problem.findOne().skip(randomIndex);
    if (!problem) throw new Error('Failed to fetch matched problem');

    // 2. Create Match in MySQL
    const match = await prisma.match.create({
      data: {
        player1_id: p1.userId,
        player2_id: p2.userId,
        problem_id: problem._id.toString(),
        status: MatchStatus.PENDING,
      },
    });

    // 3. Make sockets join the match room
    const p1Socket = io?.sockets.sockets.get(p1.socketId);
    const p2Socket = io?.sockets.sockets.get(p2.socketId);

    const roomName = `match:${match.id}`;
    p1Socket?.join(roomName);
    p2Socket?.join(roomName);

    // 4. Emit match found event to both players
    io?.to(roomName).emit('match-found', {
      matchId: match.id,
      problem: {
        id: problem._id,
        title: problem.title,
        slug: problem.slug,
        description: problem.description,
        difficulty: problem.difficulty,
        timeLimit: problem.timeLimit,
        memoryLimit: problem.memoryLimit,
        starterCodes: problem.starterCodes,
      },
      player1: { userId: p1.userId, username: p1.username, elo: p1.elo },
      player2: { userId: p2.userId, username: p2.username, elo: p2.elo },
    });

    console.log(`Match started: ${p1.username} vs ${p2.username} on Room ${roomName}`);
  } catch (err) {
    console.error('Error starting match:', err);
    // Put players back in queue
    matchmakingQueue.push(p1, p2);
  }
};

const handleSubmissionUpdate = async (data: {
  submissionId: string;
  userId: string;
  problemId: string;
  status: string;
  testCasesPassed: number;
  testCasesTotal: number;
}) => {
  // Find active match where user is either player1 or player2
  const activeMatch = await prisma.match.findFirst({
    where: {
      problem_id: data.problemId,
      status: MatchStatus.PENDING,
      OR: [
        { player1_id: data.userId },
        { player2_id: data.userId },
      ],
    },
  });

  if (!activeMatch) return;

  const roomName = `match:${activeMatch.id}`;

  // Broadcast real-time submission progress (failed cases or success)
  io?.to(roomName).emit('rival-submission', {
    userId: data.userId,
    status: data.status,
    testCasesPassed: data.testCasesPassed,
    testCasesTotal: data.testCasesTotal,
  });

  if (data.status === 'ACCEPTED') {
    // We have a winner!
    await endMatch(activeMatch.id, data.userId);
  }
};

const endMatch = async (matchId: string, winnerId: string) => {
  // Use transaction to avoid race conditions
  await prisma.$transaction(async (tx) => {
    const match = await tx.match.findUnique({ where: { id: matchId } });
    if (!match || match.status === MatchStatus.FINISHED) return;

    const player1Id = match.player1_id;
    const player2Id = match.player2_id;
    const loserId = winnerId === player1Id ? player2Id : player1Id;

    // Fetch players
    const winner = await tx.user.findUnique({ where: { id: winnerId } });
    const loser = await tx.user.findUnique({ where: { id: loserId } });

    if (!winner || !loser) return;

    // ELO updates (+25 for winner, -15 for loser)
    const newWinnerElo = winner.elo_rating + 25;
    const newLoserElo = Math.max(800, loser.elo_rating - 15); // Floor ELO at 800

    // Streak updates
    const newWinnerStreak = winner.streak_count + 1;
    const newWinnerMaxStreak = Math.max(winner.max_streak, newWinnerStreak);

    // Update match status
    await tx.match.update({
      where: { id: matchId },
      data: {
        status: MatchStatus.FINISHED,
        winner_id: winnerId,
        player1_status: winnerId === player1Id ? PlayerMatchStatus.ACCEPTED : PlayerMatchStatus.SUBMITTED_WA,
        player2_status: winnerId === player2Id ? PlayerMatchStatus.ACCEPTED : PlayerMatchStatus.SUBMITTED_WA,
      },
    });

    // Update winner
    await tx.user.update({
      where: { id: winnerId },
      data: {
        elo_rating: newWinnerElo,
        streak_count: newWinnerStreak,
        max_streak: newWinnerMaxStreak,
      },
    });

    // Update loser
    await tx.user.update({
      where: { id: loserId },
      data: {
        elo_rating: newLoserElo,
        streak_count: 0, // Reset streak on loss
      },
    });

    // Broadcast results
    io?.to(`match:${matchId}`).emit('match-ended', {
      winnerId,
      loserId,
      eloUpdates: {
        [winnerId]: { elo: newWinnerElo, change: +25, streak: newWinnerStreak },
        [loserId]: { elo: newLoserElo, change: -15, streak: 0 },
      },
    });

    console.log(`Match ${matchId} completed. Winner: ${winner.username}, Loser: ${loser.username}`);
  });
};

const handleForfeit = async (matchId: string, forfeitingUserId: string) => {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match || match.status === MatchStatus.FINISHED) return;

  const winnerId = forfeitingUserId === match.player1_id ? match.player2_id : match.player1_id;
  await endMatch(matchId, winnerId);
};
