import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { createNotificationSchema, readNotificationsSchema } from '../validators/notification.validator';

const router = Router();

router.use(requireAuth);

router.post('/', requireAdmin, validateRequest(createNotificationSchema), notificationController.createNotification);
router.get('/', notificationController.getNotifications);
router.put('/read', validateRequest(readNotificationsSchema), notificationController.markAsRead);
router.delete('/:notificationId', notificationController.deleteNotification);

export default router;
