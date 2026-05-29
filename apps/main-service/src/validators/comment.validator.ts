import { z } from 'zod';

export const createCommentSchema = z.object({
  targetId: z.string().min(1, 'Target ID is required'),
  targetType: z.enum(['PROBLEM', 'CONTEST', 'DISCUSSION']),
  content: z.string().min(1, 'Content cannot be empty').max(1000, 'Content exceeds 1000 characters'),
  parentId: z.string().uuid('Invalid parent ID format').optional(),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1, 'Content cannot be empty').max(1000, 'Content exceeds 1000 characters'),
});
