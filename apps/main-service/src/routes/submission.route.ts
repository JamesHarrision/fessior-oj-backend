import { Router } from 'express';
import { submissionController } from '../controllers/submission.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { submitCodeSchema } from '../validators/submission.validator';

const router = Router();

router.use(requireAuth);

router.post('/',
	/* #swagger.tags = ['Submissions']
		 #swagger.summary = 'Submit code for a problem'
		 #swagger.security = [{ "bearerAuth": [] }]
		 #swagger.requestBody = { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/SubmitCode' } } } }
	*/
	validateRequest(submitCodeSchema), submissionController.submit);

router.get('/',
	/* #swagger.tags = ['Submissions']
		 #swagger.summary = 'List submissions for current user'
		 #swagger.security = [{ "bearerAuth": [] }]
	*/
	submissionController.getUserSubmissions);

router.get('/:id',
	/* #swagger.tags = ['Submissions']
		 #swagger.summary = 'Get submission details'
		 #swagger.security = [{ "bearerAuth": [] }]
		 #swagger.parameters['id'] = { in: 'path', required: true, schema: { type: 'string' } }
	*/
	submissionController.getSubmissionDetails);

export default router;
