import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { createNotificationSchema, readNotificationsSchema } from '../validators/notification.validator';

const router = Router();

router.use(requireAuth);

router.post(
	'/',
/* #swagger.tags = ['Notifications']
   #swagger.summary = 'Create notification (admin)'
   #swagger.description = 'Create a system notification targeting one or more users. Admin only.'
   #swagger.security = [{ "bearerAuth": [] }]
   #swagger.requestBody = { 
     required: true, 
     content: { 
       'application/json': { 
         schema: { 
           type: 'object', 
           properties: { 
             title: { type: 'string' }, 
             body: { type: 'string' }, 
             targetUserIds: { 
               type: 'array', 
               items: { type: 'string' }, 
               description: 'Optional list of user IDs; leave empty to broadcast' 
             }, 
             meta: { type: 'object' } 
           }, 
           required: ['title', 'body'] 
         }, 
         example: { 
           title: 'Maintenance', 
           body: 'Scheduled maintenance at 00:00 UTC', 
           targetUserIds: [], 
           meta: { 
             severity: 'info' 
           } 
         } 
       } 
     }
   }
   #swagger.responses[201] = { 
     description: 'Notification created', 
     content: { 
       'application/json': { 
         example: { 
           status: 'Success', 
           message: 'Notification created', 
           data: { 
             id: 'ntf_1', 
             title: 'Maintenance' 
           } 
         } 
       } 
     }
   }
*/
	requireAdmin,
	validateRequest(createNotificationSchema),
	notificationController.createNotification
);

router.get(
	'/',
/* #swagger.tags = ['Notifications']
   #swagger.summary = 'List notifications for current user'
   #swagger.description = 'Return notifications for the authenticated user with pagination and optional unread-only filter.'
   #swagger.security = [{ "bearerAuth": [] }]
   #swagger.parameters['unread'] = { 
     in: 'query', 
     schema: { 
       type: 'boolean' 
     }, 
     description: 'If true, return only unread notifications' 
   }
   #swagger.parameters['page'] = { 
     in: 'query', 
     schema: { 
       type: 'integer', 
       default: 1 
     }, 
     description: 'Page number' 
   }
   #swagger.parameters['limit'] = { 
     in: 'query', 
     schema: { 
       type: 'integer', 
       default: 20 
     }, 
     description: 'Items per page' 
   }
   #swagger.responses[200] = { 
     description: 'Notifications list', 
     content: { 
       'application/json': { 
         example: { 
           status: 'Success', 
           message: 'Notifications fetched', 
           data: { 
             items: [ 
               { 
                 id: 'ntf_1', 
                 title: 'Maintenance', 
                 body: 'Scheduled maintenance', 
                 read: false, 
                 createdAt: '2026-06-12T12:00:00Z' 
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
	notificationController.getNotifications
);

router.put(
	'/read',
/* #swagger.tags = ['Notifications']
   #swagger.summary = 'Mark notifications as read'
   #swagger.description = 'Mark one or more notifications as read for the authenticated user.'
   #swagger.security = [{ "bearerAuth": [] }]
   #swagger.requestBody = { 
     required: true, 
     content: { 
       'application/json': { 
         schema: { 
           type: 'object', 
           properties: { 
             notificationIds: { 
               type: 'array', 
               items: { type: 'string' } 
             } 
           }, 
           required: ['notificationIds'] 
         }, 
         example: { 
           notificationIds: ['ntf_1', 'ntf_2'] 
         } 
       } 
     }
   }
   #swagger.responses[200] = { 
     description: 'Marked as read', 
     content: { 
       'application/json': { 
         example: { 
           status: 'Success', 
           message: 'Notifications marked as read', 
           data: { 
             updated: 2 
           } 
         } 
       } 
     }
   }
*/
	validateRequest(readNotificationsSchema),
	notificationController.markAsRead
);

router.delete(
	'/:notificationId',
/* #swagger.tags = ['Notifications']
   #swagger.summary = 'Delete a notification'
   #swagger.description = 'Delete a notification by id (user can remove their own; admin may remove any).'
   #swagger.security = [{ "bearerAuth": [] }]
   #swagger.parameters['notificationId'] = { 
     in: 'path', 
     required: true, 
     schema: { type: 'string' } 
   }
   #swagger.responses[200] = { 
     description: 'Notification deleted', 
     content: { 
       'application/json': { 
         example: { 
           status: 'Success', 
           message: 'Notification deleted' 
         } 
       } 
     }
   }
*/
	notificationController.deleteNotification
);

export default router;
