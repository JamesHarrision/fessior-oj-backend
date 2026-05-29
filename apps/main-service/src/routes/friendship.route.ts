import { Router } from 'express';
import { friendshipController } from '../controllers/friendship.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { friendRequestSchema, friendAcceptSchema, friendDeclineSchema } from '../validators/friendship.validator';

const router = Router();

router.use(requireAuth);

router.post('/request', validateRequest(friendRequestSchema), friendshipController.sendRequest);
router.post('/accept', validateRequest(friendAcceptSchema), friendshipController.acceptRequest);
router.post('/decline', validateRequest(friendDeclineSchema), friendshipController.declineRequest);
router.delete('/:friendId', friendshipController.removeFriendship);
router.get('/', friendshipController.getFriends);
router.get('/requests', friendshipController.getPendingRequests);

export default router;
