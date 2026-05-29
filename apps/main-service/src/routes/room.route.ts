import { Router } from 'express';
import { roomController } from '../controllers/room.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { createRoomSchema, joinRoomSchema, updateRoomSchema } from '../validators/room.validator';

const router = Router();

router.use(requireAuth);

router.post('/create', validateRequest(createRoomSchema), roomController.createRoom);
router.get('/active', roomController.getActiveRooms);
router.get('/:roomId', roomController.getRoomDetails);
router.post('/join', validateRequest(joinRoomSchema), roomController.joinRoom);
router.post('/leave', roomController.leaveRoom);
router.put('/:roomId', validateRequest(updateRoomSchema), roomController.updateRoomConfig);
router.delete('/:roomId', roomController.deleteRoom);

export default router;
