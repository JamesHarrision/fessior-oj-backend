import { z } from 'zod';

export const createNotificationSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  content: z.string().min(3, 'Content must be at least 3 characters'),
  type: z.string().min(2, 'Type must be specified'),
  data: z.string().optional(),
});

export const readNotificationsSchema = z.object({
  notificationIds: z.array(z.string().uuid('Invalid notification ID')).optional(),
});
