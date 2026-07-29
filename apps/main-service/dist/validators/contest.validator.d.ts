import { z } from 'zod';
export declare const createContestSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    startTime: z.ZodString;
    endTime: z.ZodString;
    problems: z.ZodOptional<z.ZodArray<z.ZodObject<{
        problemId: z.ZodString;
        points: z.ZodOptional<z.ZodNumber>;
        order: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const updateContestSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    startTime: z.ZodOptional<z.ZodString>;
    endTime: z.ZodOptional<z.ZodString>;
    problems: z.ZodOptional<z.ZodArray<z.ZodObject<{
        problemId: z.ZodString;
        points: z.ZodOptional<z.ZodNumber>;
        order: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
