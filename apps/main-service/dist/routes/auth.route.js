"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController = __importStar(require("../controllers/auth.controller"));
const validate_middleware_1 = require("../middlewares/validate.middleware");
const auth_validator_1 = require("../validators/auth.validator");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.post('/register', 
/* #swagger.tags = ['Auth']
     #swagger.summary = 'Register new user'
     #swagger.description = 'Create a new user account with email and password. Returns created user object (without password).'
     #swagger.requestBody = {
         required: true,
         content: {
             'application/json': {
                 schema: {
                     type: 'object',
                     properties: {
                         name: { type: 'string', description: 'Full name of the user' },
                         username: { type: 'string', description: 'Unique username (optional)' },
                         email: { type: 'string', format: 'email' },
                         password: { type: 'string', description: 'Plain text password (min length depends on validator)' }
                     },
                     required: ['email','password']
                 },
                 example: { name: 'Jane Doe', username: 'janedoe', email: 'jane@example.com', password: 's3cretPass' }
             }
         }
     }
     #swagger.responses[201] = {
         description: 'User created successfully',
         content: {
             'application/json': {
                 schema: {
                     type: 'object',
                     properties: {
                         status: { type: 'string' },
                         message: { type: 'string' },
                         data: {
                             type: 'object',
                             properties: {
                                 id: { type: 'string' },
                                 name: { type: 'string' },
                                 username: { type: 'string' },
                                 email: { type: 'string' },
                                 createdAt: { type: 'string', format: 'date-time' }
                             }
                         }
                     }
                 },
                 example: { status: 'Success', message: 'User registered successfully', data: { id: 'user_123', name: 'Jane Doe', username: 'janedoe', email: 'jane@example.com', createdAt: '2026-06-12T12:00:00Z' } }
             }
         }
     }
*/
(0, validate_middleware_1.validateRequest)(auth_validator_1.registerSchema), authController.register);
router.post('/login', 
/* #swagger.tags = ['Auth']
     #swagger.summary = 'User login'
     #swagger.description = 'Authenticate with email (or username) and password. Returns access and refresh tokens.'
     #swagger.requestBody = {
         required: true,
         content: {
             'application/json': {
                 schema: {
                     type: 'object',
                     properties: {
                         email: { type: 'string', description: 'Email or username' },
                         password: { type: 'string' }
                     },
                     required: ['email','password']
                 },
                 example: { email: 'jane@example.com', password: 's3cretPass' }
             }
         }
     }
     #swagger.responses[200] = {
         description: 'Authentication successful',
         content: {
             'application/json': {
                 schema: {
                     type: 'object',
                     properties: {
                         status: { type: 'string' },
                         message: { type: 'string' },
                         data: { type: 'object', properties: { accessToken: { type: 'string' }, refreshToken: { type: 'string' }, expiresIn: { type: 'number' } } }
                     }
                 },
                 example: { status: 'Success', message: 'Login successful', data: { accessToken: 'eyJ...', refreshToken: 'rftkn...', expiresIn: 3600 } }
             }
         }
     }
*/
(0, validate_middleware_1.validateRequest)(auth_validator_1.loginSchema), authController.login);
router.post('/logout', 
/* #swagger.tags = ['Auth']
     #swagger.summary = 'Logout (revoke refresh token)'
     #swagger.description = 'Invalidate a refresh token to log out a session. Requires Authorization header.'
     #swagger.security = [{ "bearerAuth": [] }]
     #swagger.requestBody = {
         required: true,
         content: { 'application/json': { schema: { type: 'object', properties: { refreshToken: { type: 'string' } }, required: ['refreshToken'] }, example: { refreshToken: 'rftkn...' } } }
     }
     #swagger.responses[200] = { description: 'Logged out successfully', content: { 'application/json': { example: { status: 'Success', message: 'Logged out successfully' } } } }
*/
auth_middleware_1.requireAuth, (0, validate_middleware_1.validateRequest)(auth_validator_1.refreshTokenSchema), authController.logout);
router.post('/refresh', 
/* #swagger.tags = ['Auth']
     #swagger.summary = 'Refresh access token'
     #swagger.description = 'Exchange a valid refresh token for a new access token.'
     #swagger.requestBody = { required: true, content: { 'application/json': { schema: { type: 'object', properties: { refreshToken: { type: 'string' } }, required: ['refreshToken'] }, example: { refreshToken: 'rftkn...' } } } }
     #swagger.responses[200] = { description: 'New access token', content: { 'application/json': { example: { status: 'Success', message: 'Token refreshed successfully', data: { accessToken: 'eyJ...', expiresIn: 3600 } } } } }
*/
(0, validate_middleware_1.validateRequest)(auth_validator_1.refreshTokenSchema), authController.refresh);
router.get('/me', 
/* #swagger.tags = ['Auth']
     #swagger.summary = 'Get current user profile'
     #swagger.description = 'Return the profile of the currently authenticated user.'
     #swagger.security = [{ "bearerAuth": [] }]
     #swagger.responses[200] = {
         description: 'User profile returned',
         content: {
             'application/json': {
                 schema: {
                     type: 'object',
                     properties: {
                         status: { type: 'string' },
                         message: { type: 'string' },
                         data: { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' }, username: { type: 'string' }, email: { type: 'string' } } }
                     }
                 },
                 example: { status: 'Success', message: 'User fetched successfully', data: { id: 'user_123', name: 'Jane Doe', username: 'janedoe', email: 'jane@example.com' } }
             }
         }
     }
*/
auth_middleware_1.requireAuth, authController.getMe);
router.post('/change-password', 
/* #swagger.tags = ['Auth']
     #swagger.summary = 'Change current user password'
     #swagger.description = 'Change the password for the authenticated user. Requires current password.'
     #swagger.security = [{ "bearerAuth": [] }]
     #swagger.requestBody = { required: true, content: { 'application/json': { schema: { type: 'object', properties: { oldPassword: { type: 'string' }, newPassword: { type: 'string' } }, required: ['oldPassword','newPassword'] }, example: { oldPassword: 'oldPass', newPassword: 'newPass123' } } } }
     #swagger.responses[200] = { description: 'Password changed', content: { 'application/json': { example: { status: 'Success', message: 'Password changed successfully' } } } }
*/
auth_middleware_1.requireAuth, (0, validate_middleware_1.validateRequest)(auth_validator_1.changePasswordSchema), authController.changePassword);
router.delete('/sessions/:sessionId', 
/* #swagger.tags = ['Auth']
     #swagger.summary = 'Revoke a specific session'
     #swagger.description = 'Revoke a previously issued session (by sessionId). Requires Authorization header.'
     #swagger.security = [{ "bearerAuth": [] }]
     #swagger.parameters['sessionId'] = { in: 'path', description: 'ID of the session to revoke', required: true, schema: { type: 'string' } }
     #swagger.responses[200] = { description: 'Session revoked', content: { 'application/json': { example: { status: 'Success', message: 'Session revoked successfully' } } } }
*/
auth_middleware_1.requireAuth, authController.revokeSession);
router.delete('/sessions', 
/* #swagger.tags = ['Auth']
     #swagger.summary = 'Revoke all sessions for current user'
     #swagger.description = 'Invalidate all refresh tokens / sessions for the authenticated user.'
     #swagger.security = [{ "bearerAuth": [] }]
     #swagger.responses[200] = { description: 'All sessions revoked', content: { 'application/json': { example: { status: 'Success', message: 'All sessions revoked successfully' } } } }
*/
auth_middleware_1.requireAuth, authController.revokeAllSessions);
router.get('/sessions', 
/* #swagger.tags = ['Auth']
     #swagger.summary = 'List active sessions for current user'
     #swagger.description = 'Return a list of active sessions (id, ip, userAgent, createdAt, lastActive). Requires Authorization header.'
     #swagger.security = [{ "bearerAuth": [] }]
     #swagger.responses[200] = { description: 'Sessions retrieved', content: { 'application/json': { example: { status: 'Success', message: 'Sessions retrieved successfully', data: [ { id: 'sess_1', ip: '127.0.0.1', userAgent: 'Mozilla/5.0', createdAt: '2026-06-12T12:00:00Z', lastActive: '2026-06-12T12:00:00Z' } ] } } } }
*/
auth_middleware_1.requireAuth, authController.getUserSessions);
router.post('/forgot-password', 
/* #swagger.tags = ['Auth']
     #swagger.summary = 'Request password reset email'
     #swagger.description = 'Send a password reset email with a one-time token to the provided email address.'
     #swagger.requestBody = { required: true, content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string', format: 'email' } }, required: ['email'] }, example: { email: 'jane@example.com' } } } }
     #swagger.responses[200] = { description: 'Reset email requested', content: { 'application/json': { example: { status: 'Success', message: 'Password reset email sent if account exists' } } } }
*/
(0, validate_middleware_1.validateRequest)(auth_validator_1.forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', 
/* #swagger.tags = ['Auth']
     #swagger.summary = 'Reset password using token'
     #swagger.description = 'Reset a user password using the token sent to email via forgot-password.'
     #swagger.requestBody = { required: true, content: { 'application/json': { schema: { type: 'object', properties: { token: { type: 'string' }, newPassword: { type: 'string' } }, required: ['token','newPassword'] }, example: { token: 'reset_token_123', newPassword: 'newSecurePass' } } } }
     #swagger.responses[200] = { description: 'Password reset successful', content: { 'application/json': { example: { status: 'Success', message: 'Password has been reset' } } } }
*/
(0, validate_middleware_1.validateRequest)(auth_validator_1.resetPasswordSchema), authController.resetPassword);
exports.default = router;
