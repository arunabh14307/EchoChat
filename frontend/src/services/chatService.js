import api from './api';

/**
 * Chat Service — conversations and messages API calls.
 */
const chatService = {
  // ── Conversations ──────────────────────────────────────────

  /** Get all conversations for the logged-in user. */
  getConversations: async () => {
    const response = await api.get('/conversations');
    return response.data;
  },

  /**
   * Create or fetch a 1-on-1 conversation with another user.
   * @param {string} recipientId
   */
  createOrGetConversation: async (recipientId) => {
    const response = await api.post('/conversations', { recipientId });
    return response.data;
  },

  /**
   * Toggle pin state for a conversation.
   * @param {string} conversationId
   * @param {boolean} state
   */
  pinConversation: async (conversationId, state) => {
    const response = await api.patch(`/conversations/${conversationId}/pin`, { state });
    return response.data;
  },

  /**
   * Toggle mute state for a conversation.
   * @param {string} conversationId
   * @param {boolean} state
   */
  muteConversation: async (conversationId, state) => {
    const response = await api.patch(`/conversations/${conversationId}/mute`, { state });
    return response.data;
  },

  /**
   * Toggle archive state for a conversation.
   * @param {string} conversationId
   * @param {boolean} state
   */
  archiveConversation: async (conversationId, state) => {
    const response = await api.patch(`/conversations/${conversationId}/archive`, { state });
    return response.data;
  },

  /**
   * Soft-delete/hide a conversation.
   * @param {string} conversationId
   */
  deleteConversation: async (conversationId) => {
    const response = await api.delete(`/conversations/${conversationId}`);
    return response.data;
  },

  /**
   * Create a group conversation.
   * @param {{ name: string, memberIds: string[], avatar?: File }} data
   */
  createGroupConversation: async (data) => {
    const formData = new FormData();
    formData.append('name', data.name);
    data.memberIds.forEach((id) => formData.append('memberIds', id));
    if (data.avatar) {
      formData.append('avatar', data.avatar);
    }
    const response = await api.post('/conversations/group', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // ── Messages ──────────────────────────────────────────────

  /**
   * Fetch paginated messages for a conversation.
   * @param {string} conversationId
   * @param {{ page?: number, limit?: number }} params
   */
  getMessages: async (conversationId, params = {}) => {
    const response = await api.get(`/messages/${conversationId}`, { params });
    return response.data;
  },

  /**
   * Send a text message.
   * @param {{ conversationId: string, content: string }} data
   */
  sendMessage: async (data) => {
    const response = await api.post('/messages', data);
    return response.data;
  },

  /**
   * Send a message with a media attachment (supports progress reporting and reply context).
   * @param {{ conversationId: string, file: File, content?: string, replyTo?: string, onProgress?: (ev: any) => void }} data
   */
  sendMediaMessage: async (data) => {
    const formData = new FormData();
    formData.append('conversationId', data.conversationId);
    formData.append('file', data.file);
    if (data.content) {
      formData.append('content', data.content);
    }
    if (data.replyTo) {
      formData.append('replyTo', data.replyTo);
    }

    const response = await api.post('/messages/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: data.onProgress, // Track upload percentage
    });
    return response.data;
  },

  /**
   * Mark messages in a conversation as read.
   * @param {string} conversationId
   */
  markAsRead: async (conversationId) => {
    const response = await api.patch(`/messages/${conversationId}/read`);
    return response.data;
  },
};

export default chatService;
