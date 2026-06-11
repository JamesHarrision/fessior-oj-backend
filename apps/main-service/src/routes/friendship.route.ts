import { Router } from 'express';
import { friendshipController } from '../controllers/friendship.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { friendRequestSchema, friendAcceptSchema, friendDeclineSchema } from '../validators/friendship.validator';

const router = Router();

router.use(requireAuth);

router.post('/request',
	/* #swagger.tags = ['Friendship']
		 #swagger.summary = 'Send friend request'
		 #swagger.security = [{ "bearerAuth": [] }]
		 #swagger.requestBody = { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/FriendRequest' } } } }
	*/
	validateRequest(friendRequestSchema), friendshipController.sendRequest);

router.post('/accept',
	/* #swagger.tags = ['Friendship']
		 #swagger.summary = 'Accept friend request'
		 #swagger.security = [{ "bearerAuth": [] }]
		 #swagger.requestBody = { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/FriendAccept' } } } }
	*/
	validateRequest(friendAcceptSchema), friendshipController.acceptRequest);

router.post('/decline',
	/* #swagger.tags = ['Friendship']
		 #swagger.summary = 'Decline friend request'
		 #swagger.security = [{ "bearerAuth": [] }]
		 #swagger.requestBody = { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/FriendDecline' } } } }
	*/
	validateRequest(friendDeclineSchema), friendshipController.declineRequest);

router.delete('/:friendId',
	/* #swagger.tags = ['Friendship']
		 #swagger.summary = 'Remove friend'
		 #swagger.security = [{ "bearerAuth": [] }]
		 #swagger.parameters['friendId'] = { in: 'path', required: true, schema: { type: 'string' } }
	*/
	friendshipController.removeFriendship);

router.get('/',
	/* #swagger.tags = ['Friendship']
		 #swagger.summary = 'List friends for current user'
		 #swagger.security = [{ "bearerAuth": [] }]
	*/
	friendshipController.getFriends);

router.get('/requests',
	/* #swagger.tags = ['Friendship']
		 #swagger.summary = 'Get pending friend requests'
		 #swagger.security = [{ "bearerAuth": [] }]
	*/
	friendshipController.getPendingRequests);

export default router;
