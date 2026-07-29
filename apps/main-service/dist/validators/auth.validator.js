"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.revokeSessionParamsSchema = exports.changePasswordSchema = exports.refreshTokenSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const validators_1 = require("@ocj/validators");
exports.registerSchema = zod_1.z.object({
    username: zod_1.z.string()
        .min(3, 'Username must be at least 3 characters')
        .max(50, 'Username must not exceed 50 characters')
        .regex(validators_1.USERNAME_REGEX, 'Username must only contain alphanumeric characters or underscores'),
    email: zod_1.z.string().regex(validators_1.EMAIL_REGEX, 'Invalid email format'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters').max(100).refine((val) => {
        return (0, validators_1.checkPasswordStrength)(val).isStrong;
    }, {
        message: 'Password is too weak. It must be at least 8 characters and include uppercase, lowercase, numbers, and special characters.'
    }),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().regex(validators_1.EMAIL_REGEX, 'Invalid email format'),
    password: zod_1.z.string().min(1),
});
exports.refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1),
});
exports.changePasswordSchema = zod_1.z.object({
    oldPassword: zod_1.z.string().min(1, 'Old password is required'),
    newPassword: zod_1.z.string().min(6, 'New password must be at least 6 characters').max(100).refine((val) => {
        return (0, validators_1.checkPasswordStrength)(val).isStrong;
    }, {
        message: 'New password is too weak. It must be at least 8 characters and include uppercase, lowercase, numbers, and special characters.'
    }),
});
exports.revokeSessionParamsSchema = zod_1.z.object({
    sessionId: zod_1.z.string().min(1, 'Session ID is required'),
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().regex(validators_1.EMAIL_REGEX, 'Invalid email format'),
});
exports.resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, 'Token is required'),
    newPassword: zod_1.z.string().min(6, 'Password must be at least 6 characters').max(100).refine((val) => {
        return (0, validators_1.checkPasswordStrength)(val).isStrong;
    }, {
        message: 'New password is too weak. It must be at least 8 characters and include uppercase, lowercase, numbers, and special characters.'
    }),
});
