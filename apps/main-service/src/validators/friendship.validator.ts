import { z } from 'zod';

export const friendRequestSchema = z.object({
  receiverId: z.string().min(1, 'Receiver ID or username is required'),
});

export const friendAcceptSchema = z.object({
  senderId: z.string().uuid('Invalid sender ID format'),
});

export const friendDeclineSchema = z.object({
  senderId: z.string().uuid('Invalid sender ID format'),
});
