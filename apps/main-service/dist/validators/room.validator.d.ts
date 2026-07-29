import { z } from 'zod';
export declare const createRoomSchema: z.ZodObject<{
    problemId: z.ZodOptional<z.ZodString>;
    difficulty: z.ZodOptional<z.ZodEnum<{
        EASY: "EASY";
        MEDIUM: "MEDIUM";
        HARD: "HARD";
    }>>;
    timeLimit: z.ZodOptional<z.ZodNumber>;
    memoryLimit: z.ZodOptional<z.ZodNumber>;
    maxParticipants: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const joinRoomSchema: z.ZodObject<{
    roomCode: z.ZodString;
}, z.core.$strip>;
export declare const updateRoomSchema: z.ZodObject<{
    problemId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    difficulty: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
        EASY: "EASY";
        MEDIUM: "MEDIUM";
        HARD: "HARD";
    }>>>;
    timeLimit: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    memoryLimit: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    maxParticipants: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
}, z.core.$strip>;
