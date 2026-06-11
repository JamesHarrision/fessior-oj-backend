import { Router } from 'express';
import { commentController } from '../controllers/comment.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { createCommentSchema, updateCommentSchema } from '../validators/comment.validator';

const router = Router();

// Public route to view comments
// Public route to view comments
router.get('/',
	/* #swagger.tags = ['Comments']
		 #swagger.summary = 'List comments for an entity'
		 #swagger.parameters['entityId'] = { in: 'query', description: 'Filter by entity (problem/submission) id', schema: { type: 'string' } }
	*/
	commentController.getComments);

// Auth-required routes
router.use(requireAuth);
// Auth-required routes
router.use(requireAuth);

router.post('/',
	/* #swagger.tags = ['Comments']
		 #swagger.summary = 'Create a comment'
		 #swagger.security = [{ "bearerAuth": [] }]
		 #swagger.requestBody = { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateComment' } } } }
	*/
	validateRequest(createCommentSchema), commentController.createComment);

router.put('/:commentId',
	/* #swagger.tags = ['Comments']
		 #swagger.summary = 'Update a comment'
		 #swagger.security = [{ "bearerAuth": [] }]
		 #swagger.parameters['commentId'] = { in: 'path', required: true, schema: { type: 'string' } }
		 #swagger.requestBody = { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateComment' } } } }
	*/
	validateRequest(updateCommentSchema), commentController.updateComment);

router.delete('/:commentId',
	/* #swagger.tags = ['Comments']
		 #swagger.summary = 'Delete a comment'
		 #swagger.security = [{ "bearerAuth": [] }]
		 #swagger.parameters['commentId'] = { in: 'path', required: true, schema: { type: 'string' } }
	*/
	commentController.deleteComment);

router.post('/:commentId/like',
	/* #swagger.tags = ['Comments']
		 #swagger.summary = 'Toggle like on a comment'
		 #swagger.security = [{ "bearerAuth": [] }]
		 #swagger.parameters['commentId'] = { in: 'path', required: true, schema: { type: 'string' } }
	*/
	commentController.toggleLike);

export default router;
