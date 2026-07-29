import { z } from 'zod';
export declare const submitCodeSchema: z.ZodObject<{
    problemId: z.ZodString;
    code: z.ZodString;
    language: z.ZodEnum<{
        cpp: "cpp";
        java: "java";
        python: "python";
    }>;
    matchId: z.ZodOptional<z.ZodString>;
    contestId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
