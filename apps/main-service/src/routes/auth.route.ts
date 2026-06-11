import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { registerSchema, loginSchema, refreshTokenSchema, changePasswordSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/auth.validator';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register',
	/* #swagger.tags = ['Auth']
		 #swagger.summary = 'Register new user'
		 #swagger.requestBody = { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Register' } } } }
		 #swagger.responses[201] = { description: 'User created' }
	*/
	validateRequest(registerSchema), authController.register);

router.post('/login',
	/* #swagger.tags = ['Auth']
		 #swagger.summary = 'User login'
		 #swagger.requestBody = { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Login' } } } }
		 #swagger.responses[200] = { description: 'Returns access and refresh tokens' }
	*/
	validateRequest(loginSchema), authController.login);

router.post('/logout',
	/* #swagger.tags = ['Auth']
		 #swagger.summary = 'Logout (revoke refresh token)'
		 #swagger.security = [{ "bearerAuth": [] }]
	*/
	requireAuth, validateRequest(refreshTokenSchema), authController.logout);

router.post('/refresh',
	/* #swagger.tags = ['Auth']
		 #swagger.summary = 'Refresh access token'
		 #swagger.requestBody = { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RefreshToken' } } } }
	*/
	validateRequest(refreshTokenSchema), authController.refresh);

router.get('/me',
	/* #swagger.tags = ['Auth']
		 #swagger.summary = 'Get current user profile'
		 #swagger.security = [{ "bearerAuth": [] }]
	*/
	requireAuth, authController.getMe);

router.post('/change-password',
	/* #swagger.tags = ['Auth']
		 #swagger.summary = 'Change current user password'
		 #swagger.security = [{ "bearerAuth": [] }]
		 #swagger.requestBody = { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ChangePassword' } } } }
	*/
	requireAuth, validateRequest(changePasswordSchema), authController.changePassword);

router.delete('/sessions/:sessionId',
	/* #swagger.tags = ['Auth']
		 #swagger.summary = 'Revoke a specific session'
		 #swagger.security = [{ "bearerAuth": [] }]
		 #swagger.parameters['sessionId'] = { in: 'path', required: true, schema: { type: 'string' } }
	*/
	requireAuth, authController.revokeSession);

router.delete('/sessions',
	/* #swagger.tags = ['Auth']
		 #swagger.summary = 'Revoke all sessions for current user'
		 #swagger.security = [{ "bearerAuth": [] }]
	*/
	requireAuth, authController.revokeAllSessions);

router.get('/sessions',
	/* #swagger.tags = ['Auth']
		 #swagger.summary = 'List active sessions for current user'
		 #swagger.security = [{ "bearerAuth": [] }]
	*/
	requireAuth, authController.getUserSessions);

router.post('/forgot-password',
	/* #swagger.tags = ['Auth']
		 #swagger.summary = 'Request password reset email'
		 #swagger.requestBody = { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ForgotPassword' } } } }
	*/
	validateRequest(forgotPasswordSchema), authController.forgotPassword);

router.post('/reset-password',
	/* #swagger.tags = ['Auth']
		 #swagger.summary = 'Reset password using token'
		 #swagger.requestBody = { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ResetPassword' } } } }
	*/
	validateRequest(resetPasswordSchema), authController.resetPassword);

export default router;
