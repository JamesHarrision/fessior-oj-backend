import { Router } from 'express';
import { contestController } from '../controllers/contest.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { createContestSchema, updateContestSchema } from '../validators/contest.validator';

const router = Router();

// Public routes
router.get('/', contestController.getContests);
router.get('/:contestId', contestController.getContestDetails);
router.get('/:contestId/leaderboard', contestController.getLeaderboard);

// Admin-only routes
router.post('/', requireAuth, requireAdmin, validateRequest(createContestSchema), contestController.createContest);
router.put('/:contestId', requireAuth, requireAdmin, validateRequest(updateContestSchema), contestController.updateContest);
router.delete('/:contestId', requireAuth, requireAdmin, contestController.deleteContest);

// User auth-required routes
router.post('/:contestId/register', requireAuth, contestController.register);
router.post('/:contestId/unregister', requireAuth, contestController.unregister);
router.get('/:contestId/problems', requireAuth, contestController.getContestProblems);
router.get('/:contestId/submissions', requireAuth, contestController.getContestSubmissions);

export default router;
