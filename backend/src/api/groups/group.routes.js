import { Router } from 'express';
import {
  createGroup,
  getGroup,
  updateGroup,
  deleteGroup,
  addMembers,
  removeMember,
  promoteToAdmin,
  demoteFromAdmin,
  regenerateInviteCode,
  joinGroup,
} from './group.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { uploadAvatar } from '../../middleware/upload.middleware.js';
import {
  createGroupSchema,
  updateGroupSchema,
  addMembersSchema,
  joinGroupSchema,
  regenerateInviteSchema,
} from './group.validator.js';

const router = Router();

// Secure all group routes behind authentication
router.use(authMiddleware);

router.post('/', uploadAvatar, validate(createGroupSchema), createGroup);
router.post('/join', validate(joinGroupSchema), joinGroup);
router.post('/invite/regenerate', validate(regenerateInviteSchema), regenerateInviteCode);

router.get('/:id', getGroup);
router.patch('/:id', uploadAvatar, validate(updateGroupSchema), updateGroup);
router.delete('/:id', deleteGroup);

router.post('/:id/members', validate(addMembersSchema), addMembers);
router.delete('/:id/members/:userId', removeMember);
router.patch('/:id/promote', promoteToAdmin);
router.patch('/:id/demote', demoteFromAdmin);

export default router;
