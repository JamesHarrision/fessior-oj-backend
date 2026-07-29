import { z } from 'zod';
export declare const createCommentSchema: z.ZodObject<{
    targetId: z.ZodString;
    targetType: z.ZodEnum<{
        CONTEST: "CONTEST";
        PROBLEM: "PROBLEM";
        DISCUSSION: "DISCUSSION";
    }>;
    content: z.ZodString;
    parentId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateCommentSchema: z.ZodObject<{
    content: z.ZodString;
}, z.core.$strip>;
