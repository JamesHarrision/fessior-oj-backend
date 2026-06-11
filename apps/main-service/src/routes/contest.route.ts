import { Router } from 'express';
import { contestController } from '../controllers/contest.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { createContestSchema, updateContestSchema } from '../validators/contest.validator';

const router = Router();

// Public routes
// Public routes
router.get('/',
	/* #swagger.tags = ['Contests']
		 #swagger.summary = 'List contests'
	*/
	contestController.getContests);

router.get('/:contestId',
	/* #swagger.tags = ['Contests']
		 #swagger.summary = 'Get contest details'
		 #swagger.parameters['contestId'] = { in: 'path', required: true, schema: { type: 'string' } }
	*/
	contestController.getContestDetails);

router.get('/:contestId/leaderboard',
	/* #swagger.tags = ['Contests']
		 #swagger.summary = 'Get contest leaderboard'
		 #swagger.parameters['contestId'] = { in: 'path', required: true, schema: { type: 'string' } }
	*/
	contestController.getLeaderboard);

// Admin-only routes
// Admin-only routes
router.post('/',
	/* #swagger.tags = ['Contests']
		 #swagger.summary = 'Create contest (admin)'
		 #swagger.security = [{ "bearerAuth": [] }]
		 #swagger.requestBody = { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateContest' } } } }
	*/
	requireAuth, requireAdmin, validateRequest(createContestSchema), contestController.createContest);

router.put('/:contestId',
	/* #swagger.tags = ['Contests']
		 #swagger.summary = 'Update contest (admin)'
		 #swagger.security = [{ "bearerAuth": [] }]
		 #swagger.parameters['contestId'] = { in: 'path', required: true, schema: { type: 'string' } }
	*/
	requireAuth, requireAdmin, validateRequest(updateContestSchema), contestController.updateContest);

router.delete('/:contestId',
	/* #swagger.tags = ['Contests']
		 #swagger.summary = 'Delete contest (admin)'
		 #swagger.security = [{ "bearerAuth": [] }]
		 #swagger.parameters['contestId'] = { in: 'path', required: true, schema: { type: 'string' } }
	*/
	requireAuth, requireAdmin, contestController.deleteContest);

// User auth-required routes
// User auth-required routes
router.post('/:contestId/register',
	/* #swagger.tags = ['Contests']
		 #swagger.summary = 'Register current user to contest'
		 #swagger.security = [{ "bearerAuth": [] }]
		 #swagger.parameters['contestId'] = { in: 'path', required: true, schema: { type: 'string' } }
	*/
	requireAuth, contestController.register);

router.post('/:contestId/unregister',
	/* #swagger.tags = ['Contests']
		 #swagger.summary = 'Unregister current user from contest'
		 #swagger.security = [{ "bearerAuth": [] }]
		 #swagger.parameters['contestId'] = { in: 'path', required: true, schema: { type: 'string' } }
	*/
	requireAuth, contestController.unregister);

router.get('/:contestId/problems',
	/* #swagger.tags = ['Contests']
		 #swagger.summary = 'List problems in contest for user'
		 #swagger.security = [{ "bearerAuth": [] }]
		 #swagger.parameters['contestId'] = { in: 'path', required: true, schema: { type: 'string' } }
	*/
	requireAuth, contestController.getContestProblems);

router.get('/:contestId/submissions',
	/* #swagger.tags = ['Contests']
		 #swagger.summary = 'Get submissions for contest by current user'
		 #swagger.security = [{ "bearerAuth": [] }]
		 #swagger.parameters['contestId'] = { in: 'path', required: true, schema: { type: 'string' } }
	*/
	requireAuth, contestController.getContestSubmissions);

export default router;
