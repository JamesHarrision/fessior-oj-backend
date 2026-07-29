import { z } from 'zod';
export declare const updateMeSchema: z.ZodObject<{
    full_name: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const adminUpdateUserSchema: z.ZodObject<{
    username: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    full_name: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
    elo_rating: z.ZodOptional<z.ZodNumber>;
    code_coins: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const updateRoleSchema: z.ZodObject<{
    role: z.ZodEnum<{
        USER: "USER";
        ADMIN: "ADMIN";
    }>;
}, z.core.$strip>;
export declare const banUserSchema: z.ZodObject<{
    reason: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
