"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const friendship_controller_1 = require("../controllers/friendship.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const friendship_validator_1 = require("../validators/friendship.validator");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.requireAuth);
router.post('/request', 
/* #swagger.tags = ['Friendship']
     #swagger.summary = 'Send friend request'
     #swagger.description = 'Send a friend request to another user by id or username. Requires authentication.'
     #swagger.security = [{ "bearerAuth": [] }]
     #swagger.requestBody = {
        required: true,
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        targetUserId: { type: 'string' },
                        message: { type: 'string' }
                    },
                    required: ['targetUserId']
                },
                example: {
                    targetUserId: 'user_123',
                    message: 'Hi, let\'s connect!'
                }
            }
        }
     }
     #swagger.responses[201] = {
        description: 'Friend request sent',
        content: {
            'application/json': {
                example: {
                    status: 'Success',
                    message: 'Friend request sent',
                    data: { requestId: 'fr_1', status: 'PENDING' }
                }
            }
        }
     }
*/
(0, validate_middleware_1.validateRequest)(friendship_validator_1.friendRequestSchema), friendship_controller_1.friendshipController.sendRequest);
router.post('/accept', 
/* #swagger.tags = ['Friendship']
     #swagger.summary = 'Accept friend request'
     #swagger.description = 'Accept an incoming friend request. Requires authentication.'
     #swagger.security = [{ "bearerAuth": [] }]
     #swagger.requestBody = {
        required: true,
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        requestId: { type: 'string' }
                    },
                    required: ['requestId']
                },
                example: { requestId: 'fr_1' }
            }
        }
     }
     #swagger.responses[200] = {
        description: 'Friend request accepted',
        content: {
            'application/json': {
                example: {
                    status: 'Success',
                    message: 'Friend request accepted',
                    data: { friendId: 'user_123' }
                }
            }
        }
    }
*/
(0, validate_middleware_1.validateRequest)(friendship_validator_1.friendAcceptSchema), friendship_controller_1.friendshipController.acceptRequest);
router.post('/decline', 
/* #swagger.tags = ['Friendship']
     #swagger.summary = 'Decline friend request'
     #swagger.description = 'Decline an incoming friend request. Requires authentication.'
     #swagger.security = [{ "bearerAuth": [] }]
     #swagger.requestBody = {
        required: true,
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        requestId: { type: 'string' }
                    },
                    required: ['requestId']
                },
                example: { requestId: 'fr_1' }
            }
        }
     }
     #swagger.responses[200] = {
        description: 'Friend request declined',
        content: {
            'application/json': {
                example: {
                    status: 'Success',
                    message: 'Friend request declined'
                }
            }
        }
     }
*/
(0, validate_middleware_1.validateRequest)(friendship_validator_1.friendDeclineSchema), friendship_controller_1.friendshipController.declineRequest);
router.delete('/:friendId', 
/* #swagger.tags = ['Friendship']
   #swagger.summary = 'Remove friend'
   #swagger.description = 'Remove an existing friend relationship by friendId. Requires authentication.'
   #swagger.security = [{ "bearerAuth": [] }]
   #swagger.parameters['friendId'] = {
     in: 'path',
     required: true,
     description: 'ID of the friend to remove',
     schema: { type: 'string' }
   }
   #swagger.responses[200] = {
     description: 'Friend removed',
     content: {
       'application/json': {
         example: {
           status: 'Success',
           message: 'Friend removed'
         }
       }
     }
   }
*/
friendship_controller_1.friendshipController.removeFriendship);
router.get('/', 
/* #swagger.tags = ['Friendship']
   #swagger.summary = 'List friends for current user'
   #swagger.description = 'Return the authenticated user\'s friend list. Supports pagination.'
   #swagger.security = [{ "bearerAuth": [] }]
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
     description: 'Friends list',
     content: {
       'application/json': {
         example: {
           status: 'Success',
           message: 'Friends fetched',
           data: {
             items: [
               {
                 id: 'user_123',
                 username: 'alice',
                 name: 'Alice'
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
friendship_controller_1.friendshipController.getFriends);
router.get('/requests', 
/* #swagger.tags = ['Friendship']
   #swagger.summary = 'Get pending friend requests'
   #swagger.description = 'Get incoming friend requests for the authenticated user.'
   #swagger.security = [{ "bearerAuth": [] }]
   #swagger.responses[200] = {
     description: 'Pending requests',
     content: {
       'application/json': {
         example: {
           status: 'Success',
           message: 'Pending requests fetched',
           data: [
             {
               requestId: 'fr_1',
               fromUserId: 'user_2',
               message: 'Please add me',
               createdAt: '2026-06-12T12:00:00Z'
             }
           ]
         }
       }
     }
   }
*/
friendship_controller_1.friendshipController.getPendingRequests);
exports.default = router;
