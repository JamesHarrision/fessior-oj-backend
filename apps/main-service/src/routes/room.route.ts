import { Router } from 'express';
import { roomController } from '../controllers/room.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { createRoomSchema, joinRoomSchema, updateRoomSchema } from '../validators/room.validator';

const router = Router();

router.use(requireAuth);

router.post(
	'/create',
/* #swagger.tags = ['Rooms']
   #swagger.summary = 'Create a new room'
   #swagger.description = 'Create a collaborative/problem room. Requires authentication.'
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
             isPrivate: { type: 'boolean' }, 
             maxParticipants: { type: 'integer' } 
           }, 
           required: ['title'] 
         }, 
         example: { 
           title: 'Practice Room', 
           description: 'Weekly practice', 
           isPrivate: false, 
           maxParticipants: 10 
         } 
       } 
     }
   }
   #swagger.responses[201] = { 
     description: 'Room created', 
     content: { 
       'application/json': { 
         example: { 
           status: 'Success', 
           message: 'Room created', 
           data: { 
             roomId: 'r_1', 
             title: 'Practice Room' 
           } 
         } 
       } 
     }
   }
*/
	validateRequest(createRoomSchema),
	roomController.createRoom
);

router.get(
	'/active',
/* #swagger.tags = ['Rooms']
   #swagger.summary = 'List active rooms'
   #swagger.description = 'Return currently active/joinable rooms. Supports pagination.'
   #swagger.parameters['page'] = { 
     in: 'query', 
     schema: { 
       type: 'integer', 
       default: 1 
     } 
   }
   #swagger.parameters['limit'] = { 
     in: 'query', 
     schema: { 
       type: 'integer', 
       default: 20 
     } 
   }
   #swagger.responses[200] = { 
     description: 'Active rooms', 
     content: { 
       'application/json': { 
         example: { 
           status: 'Success', 
           message: 'Active rooms fetched', 
           data: { 
             items: [ 
               { 
                 roomId: 'r_1', 
                 title: 'Practice Room', 
                 participants: 3 
               } 
             ], 
             total: 1, 
             page: 1, 
             limit: 20 
           } 
         } 
       } 
     }
   }
*/
	roomController.getActiveRooms
);

router.get(
	'/:roomId',
/* #swagger.tags = ['Rooms']
   #swagger.summary = 'Get room details'
   #swagger.description = 'Return details for a specific room including participants and settings.'
   #swagger.parameters['roomId'] = { 
     in: 'path', 
     required: true, 
     schema: { type: 'string' } 
   }
   #swagger.responses[200] = { 
     description: 'Room details', 
     content: { 
       'application/json': { 
         example: { 
           status: 'Success', 
           message: 'Room fetched', 
           data: { 
             roomId: 'r_1', 
             title: 'Practice Room', 
             participants: [ 
               { 
                 userId: 'user_1', 
                 username: 'alice' 
               } 
             ], 
             settings: { 
               isPrivate: false 
             } 
           } 
         } 
       } 
     }
   }
*/
	roomController.getRoomDetails
);

router.post(
	'/join',
/* #swagger.tags = ['Rooms']
   #swagger.summary = 'Join a room'
   #swagger.description = 'Join an existing room. If room is private, a join code or invitation may be required.'
   #swagger.security = [{ "bearerAuth": [] }]
   #swagger.requestBody = { 
     required: true, 
     content: { 
       'application/json': { 
         schema: { 
           type: 'object', 
           properties: { 
             roomId: { type: 'string' }, 
             joinCode: { type: 'string' } 
           }, 
           required: ['roomId'] 
         }, 
         example: { 
           roomId: 'r_1' 
         } 
       } 
     }
   }
   #swagger.responses[200] = { 
     description: 'Joined room', 
     content: { 
       'application/json': { 
         example: { 
           status: 'Success', 
           message: 'Joined room', 
           data: { 
             roomId: 'r_1', 
             joined: true 
           } 
         } 
       } 
     }
   }
*/
	validateRequest(joinRoomSchema),
	roomController.joinRoom
);

router.post(
	'/leave',
/* #swagger.tags = ['Rooms']
   #swagger.summary = 'Leave a room'
   #swagger.description = 'Leave a room the user has joined.'
   #swagger.security = [{ "bearerAuth": [] }]
   #swagger.requestBody = { 
     required: true, 
     content: { 
       'application/json': { 
         schema: { 
           type: 'object', 
           properties: { 
             roomId: { type: 'string' } 
           }, 
           required: ['roomId'] 
         }, 
         example: { 
           roomId: 'r_1' 
         } 
       } 
     }
   }
   #swagger.responses[200] = { 
     description: 'Left room', 
     content: { 
       'application/json': { 
         example: { 
           status: 'Success', 
           message: 'Left room' 
         } 
       } 
     }
   }
*/
	roomController.leaveRoom
);

router.put(
	'/:roomId',
/* #swagger.tags = ['Rooms']
   #swagger.summary = 'Update room configuration'
   #swagger.description = 'Update room metadata or settings (owners/admins only).'
   #swagger.security = [{ "bearerAuth": [] }]
   #swagger.parameters['roomId'] = { 
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
             maxParticipants: { type: 'integer' } 
           }, 
           example: { 
             title: 'New Room Title', 
             maxParticipants: 20 
           } 
         } 
       } 
     }
   }
   #swagger.responses[200] = { 
     description: 'Room updated', 
     content: { 
       'application/json': { 
         example: { 
           status: 'Success', 
           message: 'Room updated', 
           data: { 
             roomId: 'r_1', 
             title: 'New Room Title' 
           } 
         } 
       } 
     }
   }
*/
	validateRequest(updateRoomSchema),
	roomController.updateRoomConfig
);

router.delete(
	'/:roomId',
/* #swagger.tags = ['Rooms']
   #swagger.summary = 'Delete a room'
   #swagger.description = 'Delete a room (owner/admin only).'
   #swagger.security = [{ "bearerAuth": [] }]
   #swagger.parameters['roomId'] = { 
     in: 'path', 
     required: true, 
     schema: { type: 'string' } 
   }
   #swagger.responses[200] = { 
     description: 'Room deleted', 
     content: { 
       'application/json': { 
         example: { 
           status: 'Success', 
           message: 'Room deleted' 
         } 
       } 
     }
   }
*/
	roomController.deleteRoom
);

export default router;
