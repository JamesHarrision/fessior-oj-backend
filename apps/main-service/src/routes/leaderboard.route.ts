import { Router } from 'express';
import { leaderboardController } from '../controllers/leaderboard.controller';

const router = Router();

router.get('/', leaderboardController.getLeaderboard);

export default router;
