import User from '../../models/User.model.js';
import ApiError from '../../utils/ApiError.js';
import cloudinary from '../../config/cloudinary.js';

/**
 * findUsers — Search users by username or display name.
 * Excludes the current logged-in user.
 *
 * @param {string} query — Search query
 * @param {string} currentUserId — ID of the user performing the search
 * @returns {Promise<User[]>}
 */
export const findUsers = async (query, currentUserId) => {
  if (!query || !query.trim()) {
    return [];
  }

  const cleanQuery = query.trim();

  return await User.find({
    _id: { $ne: currentUserId },
    $or: [
      { username: { $regex: cleanQuery, $options: 'i' } },
      { displayName: { $regex: cleanQuery, $options: 'i' } },
    ],
  }).limit(20);
};

/**
 * findUserById — Get user by ID.
 * Handles privacy: if profile is private, returns restricted info unless requested by self.
 *
 * @param {string} userId — Target user ID
 * @param {string} [currentUserId] — Requesting user ID
 * @returns {Promise<User>}
 */
export const findUserById = async (userId, currentUserId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // If profile is private and request is NOT from the user themselves
  if (user.privacy === 'private' && user._id.toString() !== currentUserId) {
    return {
      _id: user._id,
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar,
      avatarUrl: user.avatarUrl,
      privacy: user.privacy,
      status: user.status,
      lastSeen: user.lastSeen,
      isRestricted: true, // flag for UI to show lock state
    };
  }

  return user;
};

/**
 * updateUser — Update user profile details.
 *
 * @param {string} userId
 * @param {{
 *   displayName?: string,
 *   bio?: string,
 *   gender?: 'male'|'female'|'other'|'prefer_not_to_say'|'',
 *   dateOfBirth?: string|null,
 *   privacy?: 'public'|'private'
 * }} updates
 * @returns {Promise<User>}
 */
export const updateUser = async (userId, updates) => {
  const allowedUpdates = ['displayName', 'bio', 'gender', 'dateOfBirth', 'privacy', 'notificationSettings'];
  const cleanUpdates = {};

  for (const key of allowedUpdates) {
    if (updates[key] !== undefined) {
      if (key === 'displayName' && updates.displayName === '') {
        continue;
      }
      cleanUpdates[key] = updates[key];
    }
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: cleanUpdates },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  return user;
};

/**
 * updateAvatar — Upload and update user avatar.
 * Deletes old avatar from Cloudinary if it exists.
 *
 * @param {string} userId
 * @param {{ url: string, publicId: string }} fileData
 * @returns {Promise<User>}
 */
export const updateAvatar = async (userId, fileData) => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Delete old avatar from Cloudinary if it exists
  if (user.avatar?.publicId) {
    try {
      await cloudinary.uploader.destroy(user.avatar.publicId);
    } catch (err) {
      console.error('[Cloudinary] Failed to delete old avatar:', err);
    }
  }

  user.avatar = {
    url: fileData.url,
    publicId: fileData.publicId,
  };

  await user.save({ validateBeforeSave: false });
  return user;
};

/**
 * updateCoverPhoto — Upload and update user cover photo.
 * Deletes old cover photo from Cloudinary if it exists.
 *
 * @param {string} userId
 * @param {{ url: string, publicId: string }} fileData
 * @returns {Promise<User>}
 */
export const updateCoverPhoto = async (userId, fileData) => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Delete old cover from Cloudinary if it exists
  if (user.coverPhoto?.publicId) {
    try {
      await cloudinary.uploader.destroy(user.coverPhoto.publicId);
    } catch (err) {
      console.error('[Cloudinary] Failed to delete old cover photo:', err);
    }
  }

  user.coverPhoto = {
    url: fileData.url,
    publicId: fileData.publicId,
  };

  await user.save({ validateBeforeSave: false });
  return user;
};
