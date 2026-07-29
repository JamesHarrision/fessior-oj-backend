import { z } from 'zod';
export declare const createNewsSchema: z.ZodObject<{
    title: z.ZodString;
    content: z.ZodString;
}, z.core.$strip>;
