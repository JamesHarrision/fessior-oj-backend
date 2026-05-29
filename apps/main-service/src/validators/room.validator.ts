import { z } from 'zod';

export const createRoomSchema = z.object({
  problemId: z.string().length(24, 'Invalid problem ID format').optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  timeLimit: z.number().int().min(100).max(10000).optional(),
  memoryLimit: z.number().int().min(16).max(1024).optional(),
});

export const joinRoomSchema = z.object({
  roomCode: z.string().min(3, 'Room code must be at least 3 characters').max(20),
});

export const updateRoomSchema = createRoomSchema.partial();
