"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readNotificationsSchema = exports.createNotificationSchema = void 0;
const zod_1 = require("zod");
exports.createNotificationSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid('Invalid user ID format'),
    title: zod_1.z.string().min(3, 'Title must be at least 3 characters'),
    content: zod_1.z.string().min(3, 'Content must be at least 3 characters'),
    type: zod_1.z.string().min(2, 'Type must be specified'),
    data: zod_1.z.string().optional(),
});
exports.readNotificationsSchema = zod_1.z.object({
    notificationIds: zod_1.z.array(zod_1.z.string().uuid('Invalid notification ID')).optional(),
});
