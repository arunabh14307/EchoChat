import api from './api';

/**
 * notificationService — Axios API integrations for fetching, reading, and clearing notifications.
 */
const notificationService = {
  /**
   * Get paginated notifications history list.
   * @param {{ page?: number, limit?: number }} params
   */
  getNotifications: async (params = {}) => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  /**
   * Mark a single notification record as read.
   * @param {string} notificationId
   */
  markAsRead: async (notificationId) => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  /**
   * Mark all notifications as read.
   */
  markAllAsRead: async () => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },

  /**
   * Delete a notification record.
   * @param {string} notificationId
   */
  deleteNotification: async (notificationId) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },
};

export default notificationService;
export { notificationService };
