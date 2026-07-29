import { z } from 'zod';
export declare const friendRequestSchema: z.ZodObject<{
    receiverId: z.ZodString;
}, z.core.$strip>;
export declare const friendAcceptSchema: z.ZodObject<{
    senderId: z.ZodString;
}, z.core.$strip>;
export declare const friendDeclineSchema: z.ZodObject<{
    senderId: z.ZodString;
}, z.core.$strip>;
