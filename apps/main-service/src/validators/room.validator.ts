import { z } from 'zod';
import { ROOM_CODE_REGEX } from '@ocj/validators';

export const createRoomSchema = z.object({
  problemId: z.string().length(24, 'Invalid problem ID format').optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  timeLimit: z.number().int().min(100).max(10000).optional(),
  memoryLimit: z.number().int().min(16).max(1024).optional(),
  maxParticipants: z.number().int().min(2).max(10).optional(),
});

export const joinRoomSchema = z.object({
  roomCode: z.string().regex(ROOM_CODE_REGEX, 'Room code must be exactly 6 alphanumeric characters'),
});

export const updateRoomSchema = createRoomSchema.partial();
