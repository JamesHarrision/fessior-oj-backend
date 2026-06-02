import { prisma } from '../config/prisma';
import { Problem } from '../models/problem.model';
import { MatchStatus, PlayerMatchStatus } from '@prisma/client';
import { io } from './socket';
import { SOCKET_EVENTS } from '@ocj/constants';
import { calculateEloPvP } from '@ocj/utils';

export interface QueuePlayer {
  userId: string;
  socketId: string;
  username: string;
  elo: number;
}

export const matchmakingQueue: QueuePlayer[] = [];

export const removeUserFromQueue = (userId: string) => {
  const index = matchmakingQueue.findIndex((p) => p.userId === userId);
  if (index !== -1) {
    console.log(`Removing user from queue: ${matchmakingQueue[index].username}`);
    matchmakingQueue.splice(index, 1);
  }
};

export const tryMatchmaking = async () => {
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

export const startMatch = async (p1: QueuePlayer, p2: QueuePlayer) => {
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
    io?.to(roomName).emit(SOCKET_EVENTS.MATCH_FOUND, {
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

export const handleSubmissionUpdate = async (data: {
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
  io?.to(roomName).emit(SOCKET_EVENTS.RIVAL_SUBMISSION, {
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

export const endMatch = async (matchId: string, winnerId: string) => {
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

    // ELO updates
    const { newWinnerElo, newLoserElo, winnerChange, loserChange } = calculateEloPvP(
      winner.elo_rating,
      loser.elo_rating
    );

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
    io?.to(`match:${matchId}`).emit(SOCKET_EVENTS.MATCH_ENDED, {
      winnerId,
      loserId,
      eloUpdates: {
        [winnerId]: { elo: newWinnerElo, change: winnerChange, streak: newWinnerStreak },
        [loserId]: { elo: newLoserElo, change: loserChange, streak: 0 },
      },
    });

    console.log(`Match ${matchId} completed. Winner: ${winner.username}, Loser: ${loser.username}`);
  });
};

export const handleForfeit = async (matchId: string, forfeitingUserId: string) => {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match || match.status === MatchStatus.FINISHED) return;

  const winnerId = forfeitingUserId === match.player1_id ? match.player2_id : match.player1_id;
  await endMatch(matchId, winnerId);
};
