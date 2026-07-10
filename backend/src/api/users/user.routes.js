import { Router } from 'express';
import {
  getMe,
  updateProfile,
  searchUsers,
  getUserById,
  uploadAvatar as ctrlUploadAvatar,
  uploadCoverPhoto as ctrlUploadCoverPhoto,
} from './user.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { uploadAvatar, uploadCover } from '../../middleware/upload.middleware.js';
import { updateUserSchema } from './user.validator.js';

/**
 * User routes — mounted at /api/users
 *
 * GET    /api/users/me        — Get current user profile
 * PATCH  /api/users/me        — Update profile details
 * GET    /api/users/search    — Search users by username or display name
 * GET    /api/users/:id       — Get specific user public profile by ID
 * PATCH  /api/users/me/avatar — Upload avatar photo
 * PATCH  /api/users/me/cover  — Upload cover photo
 */
const router = Router();

// Apply authMiddleware universally to all user routes
router.use(authMiddleware);

router.get('/me', getMe);
router.patch('/me', validate(updateUserSchema), updateProfile);
router.get('/search', searchUsers);
router.get('/:id', getUserById);
router.patch('/me/avatar', uploadAvatar, ctrlUploadAvatar);
router.patch('/me/cover', uploadCover, ctrlUploadCoverPhoto);

export default router;
