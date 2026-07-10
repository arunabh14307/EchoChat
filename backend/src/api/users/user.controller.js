import * as userService from './user.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import ApiError from '../../utils/ApiError.js';

// ── GET /api/users/me ──────────────────────────────────────────
export const getMe = async (req, res, next) => {
  try {
    const user = await userService.findUserById(req.user.userId, req.user.userId);
    res.status(200).json(
      new ApiResponse(200, 'User profile retrieved successfully', { user })
    );
  } catch (error) {
    next(error);
  }
};

// ── PATCH /api/users/me ────────────────────────────────────────
export const updateProfile = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.user.userId, req.body);
    res.status(200).json(
      new ApiResponse(200, 'Profile updated successfully', { user })
    );
  } catch (error) {
    next(error);
  }
};

// ── GET /api/users/search ──────────────────────────────────────
export const searchUsers = async (req, res, next) => {
  try {
    const query = req.query.q || '';
    const users = await userService.findUsers(query, req.user.userId);

    res.status(200).json(
      new ApiResponse(200, 'Users searched successfully', { users })
    );
  } catch (error) {
    next(error);
  }
};

// ── GET /api/users/:id ─────────────────────────────────────────
export const getUserById = async (req, res, next) => {
  try {
    const user = await userService.findUserById(req.params.id, req.user.userId);
    res.status(200).json(
      new ApiResponse(200, 'User profile fetched successfully', { user })
    );
  } catch (error) {
    next(error);
  }
};

// ── PATCH /api/users/me/avatar ─────────────────────────────────
export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      throw ApiError.badRequest('No avatar image file provided');
    }

    const user = await userService.updateAvatar(req.user.userId, {
      url: req.file.path,
      publicId: req.file.filename,
    });

    res.status(200).json(
      new ApiResponse(200, 'Avatar image updated successfully', { user })
    );
  } catch (error) {
    next(error);
  }
};

// ── PATCH /api/users/me/cover ──────────────────────────────────
export const uploadCoverPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      throw ApiError.badRequest('No cover image file provided');
    }

    const user = await userService.updateCoverPhoto(req.user.userId, {
      url: req.file.path,
      publicId: req.file.filename,
    });

    res.status(200).json(
      new ApiResponse(200, 'Cover photo updated successfully', { user })
    );
  } catch (error) {
    next(error);
  }
};
