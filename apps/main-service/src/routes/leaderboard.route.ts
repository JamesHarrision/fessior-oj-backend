import { Router } from 'express';
import { leaderboardController } from '../controllers/leaderboard.controller';

const router = Router();

router.get('/',
	/* #swagger.tags = ['Leaderboard']
		 #swagger.summary = 'Get global leaderboard'
		 #swagger.parameters['limit'] = { in: 'query', schema: { type: 'number' }, description: 'Limit results' }
	*/
	leaderboardController.getLeaderboard);

export default router;
