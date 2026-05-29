import { z } from 'zod';

export const createContestSchema = z
  .object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional(),
    startTime: z.string().datetime('Invalid start time format'),
    endTime: z.string().datetime('Invalid end time format'),
    problems: z
      .array(
        z.object({
          problemId: z.string().length(24, 'Invalid problem ID format'),
          points: z.number().int().nonnegative().optional(),
          order: z.number().int().nonnegative().optional(),
        })
      )
      .optional(),
  })
  .refine((data) => new Date(data.endTime) > new Date(data.startTime), {
    message: 'End time must be after start time',
    path: ['endTime'],
  });

export const updateContestSchema = z
  .object({
    title: z.string().min(3).optional(),
    description: z.string().optional(),
    startTime: z.string().datetime().optional(),
    endTime: z.string().datetime().optional(),
    problems: z
      .array(
        z.object({
          problemId: z.string().length(24),
          points: z.number().int().nonnegative().optional(),
          order: z.number().int().nonnegative().optional(),
        })
      )
      .optional(),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        return new Date(data.endTime) > new Date(data.startTime);
      }
      return true;
    },
    {
      message: 'End time must be after start time',
      path: ['endTime'],
    }
  );
