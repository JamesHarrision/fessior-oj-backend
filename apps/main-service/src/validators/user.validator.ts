import { z } from 'zod';

export const updateMeSchema = z.object({
  full_name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
});

export const adminUpdateUserSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  email: z.string().email().optional(),
  full_name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  elo_rating: z.number().int().min(0).max(3000).optional(),
  code_coins: z.number().int().min(0).optional(),
});