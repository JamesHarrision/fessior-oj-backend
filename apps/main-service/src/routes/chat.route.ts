import { Router } from 'express';
import { chatController } from '../controllers/chat.controller';

const router = Router();

router.get('/sessions', chatController.getSessions);
router.post('/sessions/:sessionId/messages', chatController.sendMessage);

export default router;
