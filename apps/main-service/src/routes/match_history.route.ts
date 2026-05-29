import { Router } from 'express';
import { matchHistoryController } from '../controllers/match_history.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.get('/history', requireAuth, matchHistoryController.getHistory);
router.get('/:matchId', requireAuth, matchHistoryController.getMatchDetails);
router.delete('/:matchId', requireAuth, requireAdmin, matchHistoryController.deleteMatch);

export default router;
