import { z } from 'zod';

export const friendRequestSchema = z.object({
  receiverId: z.string().uuid('Invalid receiver ID format'),
});

export const friendAcceptSchema = z.object({
  senderId: z.string().uuid('Invalid sender ID format'),
});

export const friendDeclineSchema = z.object({
  senderId: z.string().uuid('Invalid sender ID format'),
});
