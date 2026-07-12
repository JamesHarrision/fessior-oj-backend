import { Router } from 'express';
import { contestController } from '../controllers/contest.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { createContestSchema, updateContestSchema } from '../validators/contest.validator';

const router = Router();

// Public: list contests
router.get(
	'/',
	/* #swagger.tags = ['Contests']
		 #swagger.summary = 'List contests'
		 #swagger.description = 'Return paginated list of contests with basic metadata.'
		 #swagger.parameters['page'] = { in: 'query', description: 'Page number', schema: { type: 'integer', default: 1 } }
		 #swagger.parameters['limit'] = { in: 'query', description: 'Items per page', schema: { type: 'integer', default: 20 } }
		 #swagger.responses[200] = {
			 description: 'Contests list',
			 content: {
				 'application/json': {
					 schema: {
						 type: 'object',
						 properties: {
							 status: { type: 'string' },
							 message: { type: 'string' },
							 data: { type: 'object', properties: { items: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, title: { type: 'string' }, startAt: { type: 'string', format: 'date-time' }, endAt: { type: 'string', format: 'date-time' }, status: { type: 'string' } } } }, total: { type: 'integer' }, page: { type: 'integer' }, limit: { type: 'integer' } } }
						 }
					 },
					 example: { status: 'Success', message: 'Contests fetched', data: { items: [ { id: 'contest_1', title: 'June Challenge', startAt: '2026-06-20T10:00:00Z', endAt: '2026-06-20T13:00:00Z', status: 'UPCOMING' } ], total: 1, page: 1, limit: 20 } }
				 }
			 }
		 }
	*/
	contestController.getContests
);

router.get(
	'/:contestId',
/* #swagger.tags = ['Contests']
   #swagger.summary = 'Get contest details'
   #swagger.parameters['contestId'] = { 
     in: 'path', 
     required: true, 
     schema: { type: 'string' } 
   }
   #swagger.responses[200] = { 
     description: 'Contest details', 
     content: { 
       'application/json': { 
         schema: { 
           type: 'object', 
           properties: { 
             status: { type: 'string' }, 
             message: { type: 'string' }, 
             data: { 
               type: 'object', 
               properties: { 
                 id: { type: 'string' }, 
                 title: { type: 'string' }, 
                 description: { type: 'string' }, 
                 startAt: { type: 'string', format: 'date-time' }, 
                 endAt: { type: 'string', format: 'date-time' }, 
                 durationMinutes: { type: 'integer' }, 
                 status: { type: 'string' } 
               } 
             } 
           } 
         }, 
         example: { 
           status: 'Success', 
           message: 'Contest fetched', 
           data: { 
             id: 'contest_1', 
             title: 'June Challenge', 
             description: 'Monthly contest', 
             startAt: '2026-06-20T10:00:00Z', 
             endAt: '2026-06-20T13:00:00Z', 
             durationMinutes: 180, 
             status: 'UPCOMING' 
           } 
         } 
       } 
     }
   }
*/
	contestController.getContestDetails
);

router.get(
	'/:contestId/leaderboard',
/* #swagger.tags = ['Contests']
   #swagger.summary = 'Get contest leaderboard'
   #swagger.parameters['contestId'] = { 
     in: 'path', 
     required: true, 
     schema: { type: 'string' } 
   }
   #swagger.parameters['page'] = { 
     in: 'query', 
     description: 'Page number', 
     schema: { 
       type: 'integer', 
       default: 1 
     } 
   }
   #swagger.parameters['limit'] = { 
     in: 'query', 
     description: 'Items per page', 
     schema: { 
       type: 'integer', 
       default: 50 
     } 
   }
   #swagger.responses[200] = { 
     description: 'Leaderboard', 
     content: { 
       'application/json': { 
         example: { 
           status: 'Success', 
           message: 'Leaderboard fetched', 
           data: { 
             items: [ 
               { 
                 rank: 1, 
                 userId: 'user_1', 
                 score: 500, 
                 solved: 3 
               } 
             ], 
             total: 1, 
             page: 1, 
             limit: 50 
           } 
         } 
       } 
     }
   }
*/
	contestController.getLeaderboard
);

// Admin-only routes
router.post(
	'/',
/* #swagger.tags = ['Contests']
   #swagger.summary = 'Create contest (admin)'
   #swagger.description = 'Create a new contest. Requires admin privileges.'
   #swagger.security = [{ "bearerAuth": [] }]
   #swagger.requestBody = { 
     required: true, 
     content: { 
       'application/json': { 
         schema: { 
           type: 'object', 
           properties: { 
             title: { type: 'string' }, 
             description: { type: 'string' }, 
             startAt: { type: 'string', format: 'date-time' }, 
             endAt: { type: 'string', format: 'date-time' }, 
             problems: { 
               type: 'array', 
               items: { type: 'string' } 
             } 
           }, 
           required: ['title', 'startAt', 'endAt'] 
         }, 
         example: { 
           title: 'June Challenge', 
           description: 'Monthly contest', 
           startAt: '2026-06-20T10:00:00Z', 
           endAt: '2026-06-20T13:00:00Z', 
           problems: ['prob_1', 'prob_2'] 
         } 
       } 
     }
   }
   #swagger.responses[201] = { 
     description: 'Contest created', 
     content: { 
       'application/json': { 
         example: { 
           status: 'Success', 
           message: 'Contest created', 
           data: { 
             id: 'contest_1', 
             title: 'June Challenge' 
           } 
         } 
       } 
     }
   }
*/
	requireAuth,
	requireAdmin,
	validateRequest(createContestSchema),
	contestController.createContest
);

router.put(
	'/:contestId',
/* #swagger.tags = ['Contests']
   #swagger.summary = 'Update contest (admin)'
   #swagger.description = 'Update contest metadata. Requires admin privileges.'
   #swagger.security = [{ "bearerAuth": [] }]
   #swagger.parameters['contestId'] = { 
     in: 'path', 
     required: true, 
     schema: { type: 'string' } 
   }
   #swagger.requestBody = { 
     required: true, 
     content: { 
       'application/json': { 
         schema: { 
           type: 'object', 
           properties: { 
             title: { type: 'string' }, 
             description: { type: 'string' }, 
             startAt: { type: 'string', format: 'date-time' }, 
             endAt: { type: 'string', format: 'date-time' } 
           }, 
           example: { 
             title: 'Updated Title', 
             description: 'Updated desc' 
           } 
         } 
       } 
     }
   }
   #swagger.responses[200] = { 
     description: 'Contest updated', 
     content: { 
       'application/json': { 
         example: { 
           status: 'Success', 
           message: 'Contest updated', 
           data: { 
             id: 'contest_1', 
             title: 'Updated Title' 
           } 
         } 
       } 
     }
   }
*/
	requireAuth,
	requireAdmin,
	validateRequest(updateContestSchema),
	contestController.updateContest
);

router.post(
	'/:contestId/end',
/* #swagger.tags = ['Contests']
   #swagger.summary = 'End contest and calculate ELO (admin)'
   #swagger.security = [{ "bearerAuth": [] }]
*/
	requireAuth,
	requireAdmin,
	contestController.endContest
);

router.delete(
	'/:contestId',
/* #swagger.tags = ['Contests']
   #swagger.summary = 'Delete contest (admin)'
   #swagger.description = 'Remove a contest. Requires admin privileges.'
   #swagger.security = [{ "bearerAuth": [] }]
   #swagger.parameters['contestId'] = { 
     in: 'path', 
     required: true, 
     schema: { type: 'string' } 
   }
   #swagger.responses[200] = { 
     description: 'Contest deleted', 
     content: { 
       'application/json': { 
         example: { 
           status: 'Success', 
           message: 'Contest deleted' 
         } 
       } 
     }
   }
*/
	requireAuth,
	requireAdmin,
	contestController.deleteContest
);

// User auth-required routes
router.post(
	'/:contestId/register',
/* #swagger.tags = ['Contests']
   #swagger.summary = 'Register current user to contest'
   #swagger.description = 'Register the authenticated user to participate in the contest.'
   #swagger.security = [{ "bearerAuth": [] }]
   #swagger.parameters['contestId'] = { 
     in: 'path', 
     required: true, 
     schema: { type: 'string' } 
   }
   #swagger.responses[200] = { 
     description: 'Registered', 
     content: { 
       'application/json': { 
         example: { 
           status: 'Success', 
           message: 'Registered to contest' 
         } 
       } 
     }
   }
*/
	requireAuth,
	contestController.register
);

router.post(
	'/:contestId/unregister',
	/* #swagger.tags = ['Contests']
		 #swagger.summary = 'Unregister current user from contest'
		 #swagger.description = 'Remove the authenticated user from contest participation.'
		 #swagger.security = [{ "bearerAuth": [] }]
		 #swagger.parameters['contestId'] = { in: 'path', required: true, schema: { type: 'string' } }
		 #swagger.responses[200] = { description: 'Unregistered', content: { 'application/json': { example: { status: 'Success', message: 'Unregistered from contest' } } } }
	*/
	requireAuth,
	contestController.unregister
);

router.get(
	'/:contestId/problems',
/* #swagger.tags = ['Contests']
   #swagger.summary = 'Unregister current user from contest'
   #swagger.description = 'Remove the authenticated user from contest participation.'
   #swagger.security = [{ "bearerAuth": [] }]
   #swagger.parameters['contestId'] = { 
     in: 'path', 
     required: true, 
     schema: { type: 'string' } 
   }
   #swagger.responses[200] = { 
     description: 'Unregistered', 
     content: { 
       'application/json': { 
         example: { 
           status: 'Success', 
           message: 'Unregistered from contest' 
         } 
       } 
     }
   }
*/
	requireAuth,
	contestController.getContestProblems
);

router.get(
	'/:contestId/submissions',
/* #swagger.tags = ['Contests']
   #swagger.summary = 'Get submissions for contest by current user'
   #swagger.description = 'List submissions made by the authenticated user within the contest.'
   #swagger.security = [{ "bearerAuth": [] }]
   #swagger.parameters['contestId'] = { 
     in: 'path', 
     required: true, 
     schema: { type: 'string' } 
   }
   #swagger.responses[200] = { 
     description: 'Submissions list', 
     content: { 
       'application/json': { 
         example: { 
           status: 'Success', 
           message: 'Submissions fetched', 
           data: [ 
             { 
               id: 'sub_1', 
               problemId: 'prob_1', 
               verdict: 'AC', 
               submittedAt: '2026-06-20T10:15:00Z' 
             } 
           ] 
         } 
       } 
     }
   }
*/
	requireAuth,
	contestController.getContestSubmissions
);

export default router;
