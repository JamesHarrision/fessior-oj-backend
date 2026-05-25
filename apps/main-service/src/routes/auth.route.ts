import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { registerSchema, loginSchema, refreshTokenSchema, changePasswordSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/auth.validator';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/logout', requireAuth, validateRequest(refreshTokenSchema), authController.logout);
router.post('/refresh', validateRequest(refreshTokenSchema), authController.refresh);
router.get('/me', requireAuth, authController.getMe);
router.post('/change-password', requireAuth, validateRequest(changePasswordSchema), authController.changePassword);
router.delete('/sessions/:sessionId', requireAuth, authController.revokeSession);
router.delete('/sessions', requireAuth, authController.revokeAllSessions);
router.get('/sessions', requireAuth, authController.getUserSessions);
router.post('/forgot-password', validateRequest(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validateRequest(resetPasswordSchema), authController.resetPassword);

export default router;
