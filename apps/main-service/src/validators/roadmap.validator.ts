import { z } from 'zod';

export const generateRoadmapSchema = z.object({
  body: z.object({
    prompt: z.string().min(1, 'Prompt is required'),
    startDate: z.string().nullable().optional(),
  }),
});

export const updateRoadmapSessionSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid session ID'),
  }),
  body: z.object({
    date: z.string().optional(),
    is_completed: z.boolean().optional(),
  }).refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  }),
});
