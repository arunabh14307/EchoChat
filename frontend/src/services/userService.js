import api from './api';

/**
 * User Service — user profile and search API calls.
 */
const userService = {
  /**
   * Search for users by username or display name.
   * @param {string} query
   */
  searchUsers: async (query) => {
    const response = await api.get('/users/search', { params: { q: query } });
    return response.data;
  },

  /**
   * Get a user's public profile by ID.
   * @param {string} userId
   */
  getUserById: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  /**
   * Get current user's profile.
   */
  getMe: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  /**
   * Update the logged-in user's profile.
   * @param {{
   *   displayName?: string,
   *   bio?: string,
   *   gender?: 'male'|'female'|'other'|'prefer_not_to_say'|'',
   *   dateOfBirth?: string|null,
   *   privacy?: 'public'|'private'
   * }} data
   */
  updateProfile: async (data) => {
    const response = await api.patch('/users/me', data);
    return response.data;
  },

  /**
   * Upload a new profile avatar.
   * @param {File} file
   */
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.patch('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Upload a new cover photo.
   * @param {File} file
   */
  uploadCoverPhoto: async (file) => {
    const formData = new FormData();
    formData.append('cover', file);
    const response = await api.patch('/users/me/cover', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export default userService;
