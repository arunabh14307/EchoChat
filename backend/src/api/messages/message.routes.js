import { Router } from 'express';
import {
  sendMessage,
  sendMediaMessage,
  getMessages,
  editMessage,
  deleteMessageForEveryone,
  deleteMessageForMe,
  markAsRead,
} from './message.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { uploadMedia } from '../../middleware/upload.middleware.js';
import { sendMessageSchema, editMessageSchema } from './message.validator.js';

/**
 * Message routes — mounted at /api/messages
 */
const router = Router();

// Secure all messaging routes behind authMiddleware
router.use(authMiddleware);

router.post('/', validate(sendMessageSchema), sendMessage);
router.post('/media', uploadMedia, sendMediaMessage);
router.get('/:conversationId', getMessages);
router.patch('/:id', validate(editMessageSchema), editMessage);
router.delete('/:id', deleteMessageForEveryone);
router.delete('/:id/me', deleteMessageForMe);
router.patch('/:conversationId/read', markAsRead);

export default router;
