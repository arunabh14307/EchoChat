import { Router } from 'express';
import {
  createOrGetConversation,
  getConversations,
  getConversationById,
  deleteConversation,
  pinConversation,
  muteConversation,
  archiveConversation,
  createGroupConversation,
} from './conversation.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { uploadAvatar } from '../../middleware/upload.middleware.js';
import {
  createConversationSchema,
  createGroupSchema,
  toggleStateSchema,
} from './conversation.validator.js';

/**
 * Conversation routes — mounted at /api/conversations
 */
const router = Router();

// Apply authMiddleware to protect all conversation endpoints
router.use(authMiddleware);

router.post('/', validate(createConversationSchema), createOrGetConversation);
router.get('/', getConversations);
router.get('/:conversationId', getConversationById);
router.delete('/:conversationId', deleteConversation);

router.patch('/:conversationId/pin', validate(toggleStateSchema), pinConversation);
router.patch('/:conversationId/mute', validate(toggleStateSchema), muteConversation);
router.patch('/:conversationId/archive', validate(toggleStateSchema), archiveConversation);

// Scaffolding group creation
router.post('/group', uploadAvatar, validate(createGroupSchema), createGroupConversation);

export default router;
