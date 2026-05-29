import { z } from 'zod';

export const createReportSchema = z.object({
  type: z.enum(['BUG', 'TYPO', 'CHEATING', 'OTHERS']),
  content: z.string().min(5, 'Content must be at least 5 characters'),
  reportedUserId: z.string().uuid('Invalid reported user ID').optional(),
  problemId: z.string().min(1, 'Invalid problem ID').optional(),
});

export const updateReportSchema = z.object({
  status: z.enum(['PENDING', 'RESOLVED', 'REJECTED']),
});
