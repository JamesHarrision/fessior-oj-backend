import { z } from 'zod';
export declare const createProblemSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    difficulty: z.ZodEnum<{
        EASY: "EASY";
        MEDIUM: "MEDIUM";
        HARD: "HARD";
    }>;
    timeLimit: z.ZodDefault<z.ZodNumber>;
    memoryLimit: z.ZodDefault<z.ZodNumber>;
    starterCodes: z.ZodDefault<z.ZodObject<{
        cpp: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        java: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        python: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    }, z.core.$strip>>;
    editorialMarkdown: z.ZodOptional<z.ZodString>;
    editorialVideoUrl: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    tags: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
}, z.core.$strip>;
export declare const updateProblemSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    difficulty: z.ZodOptional<z.ZodEnum<{
        EASY: "EASY";
        MEDIUM: "MEDIUM";
        HARD: "HARD";
    }>>;
    timeLimit: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    memoryLimit: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    starterCodes: z.ZodOptional<z.ZodDefault<z.ZodObject<{
        cpp: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        java: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        python: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    }, z.core.$strip>>>;
    editorialMarkdown: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    editorialVideoUrl: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
    tags: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>>;
}, z.core.$strip>;
export declare const createTestcaseSchema: z.ZodObject<{
    isExample: z.ZodDefault<z.ZodBoolean>;
    input: z.ZodString;
    output: z.ZodString;
}, z.core.$strip>;
