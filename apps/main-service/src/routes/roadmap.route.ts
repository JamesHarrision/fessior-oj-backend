import { Router } from 'express';
import { roadmapController } from '../controllers/roadmap.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { generateRoadmapSchema, updateRoadmapSessionSchema } from '../validators/roadmap.validator';

const router = Router();

// All routes require authentication
router.use(requireAuth);

router.post('/', validateRequest(generateRoadmapSchema), roadmapController.generateRoadmap);
router.get('/', roadmapController.getUserRoadmaps);
router.get('/:id', roadmapController.getRoadmapDetail);
router.patch('/sessions/:id', validateRequest(updateRoadmapSessionSchema), roadmapController.updateSession);
router.patch('/:id/share', roadmapController.toggleShare);
router.delete('/:id', roadmapController.deleteRoadmap);

export default router;
