import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);

router.post('/roadmap', aiController.generateRoadmap);
router.post('/feedback/:submissionId', aiController.generateMockInterviewFeedback);

export default router;
