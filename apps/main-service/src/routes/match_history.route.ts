import { Router } from 'express';
import { matchHistoryController } from '../controllers/match_history.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.get('/history',
	/* #swagger.tags = ['MatchHistory']
		 #swagger.summary = 'Get match history for current user'
		 #swagger.security = [{ "bearerAuth": [] }]
	*/
	requireAuth, matchHistoryController.getHistory);

router.get('/:matchId',
	/* #swagger.tags = ['MatchHistory']
		 #swagger.summary = 'Get details for a match'
		 #swagger.security = [{ "bearerAuth": [] }]
		 #swagger.parameters['matchId'] = { in: 'path', required: true, schema: { type: 'string' } }
	*/
	requireAuth, matchHistoryController.getMatchDetails);

router.delete('/:matchId',
	/* #swagger.tags = ['MatchHistory']
		 #swagger.summary = 'Delete match (admin)'
		 #swagger.security = [{ "bearerAuth": [] }]
		 #swagger.parameters['matchId'] = { in: 'path', required: true, schema: { type: 'string' } }
	*/
	requireAuth, requireAdmin, matchHistoryController.deleteMatch);

export default router;
