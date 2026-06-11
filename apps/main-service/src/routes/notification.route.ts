import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { createNotificationSchema, readNotificationsSchema } from '../validators/notification.validator';

const router = Router();

router.use(requireAuth);

router.post('/',
	/* #swagger.tags = ['Notifications']
		 #swagger.summary = 'Create notification (admin)'
		 #swagger.security = [{ "bearerAuth": [] }]
		 #swagger.requestBody = { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateNotification' } } } }
	*/
	requireAdmin, validateRequest(createNotificationSchema), notificationController.createNotification);

router.get('/',
	/* #swagger.tags = ['Notifications']
		 #swagger.summary = 'List notifications for current user'
		 #swagger.security = [{ "bearerAuth": [] }]
	*/
	notificationController.getNotifications);

router.put('/read',
	/* #swagger.tags = ['Notifications']
		 #swagger.summary = 'Mark notifications as read'
		 #swagger.security = [{ "bearerAuth": [] }]
		 #swagger.requestBody = { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ReadNotifications' } } } }
	*/
	validateRequest(readNotificationsSchema), notificationController.markAsRead);

router.delete('/:notificationId',
	/* #swagger.tags = ['Notifications']
		 #swagger.summary = 'Delete a notification'
		 #swagger.security = [{ "bearerAuth": [] }]
		 #swagger.parameters['notificationId'] = { in: 'path', required: true, schema: { type: 'string' } }
	*/
	notificationController.deleteNotification);

export default router;
