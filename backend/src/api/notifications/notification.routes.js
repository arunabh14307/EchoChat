import { Router } from 'express';
import {
  getNotifications,
  readNotification,
  readAllNotifications,
  removeNotification,
} from './notification.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { getNotificationsQuerySchema } from './notification.validator.js';

const router = Router();

// Protect all notification routes
router.use(authMiddleware);

router.get('/', validate(getNotificationsQuerySchema), getNotifications);
router.patch('/read-all', readAllNotifications);
router.patch('/:id/read', readNotification);
router.delete('/:id', removeNotification);

export default router;
