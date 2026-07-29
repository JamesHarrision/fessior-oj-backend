import { z } from 'zod';
export declare const createNotificationSchema: z.ZodObject<{
    userId: z.ZodString;
    title: z.ZodString;
    content: z.ZodString;
    type: z.ZodString;
    data: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const readNotificationsSchema: z.ZodObject<{
    notificationIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
