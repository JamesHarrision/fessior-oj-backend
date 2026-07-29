import { z } from 'zod';
export declare const createReportSchema: z.ZodObject<{
    type: z.ZodEnum<{
        BUG: "BUG";
        TYPO: "TYPO";
        CHEATING: "CHEATING";
        OTHERS: "OTHERS";
    }>;
    content: z.ZodString;
    reportedUserId: z.ZodOptional<z.ZodString>;
    problemId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateReportSchema: z.ZodObject<{
    status: z.ZodEnum<{
        PENDING: "PENDING";
        RESOLVED: "RESOLVED";
        REJECTED: "REJECTED";
    }>;
}, z.core.$strip>;
