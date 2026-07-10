import api from './api';

/**
 * groupService — API integrations for private group conversations, invite links, and admin promotions.
 */
const groupService = {
  /**
   * Create a new group.
   * @param {{ name: string, description?: string, memberIds: string[], avatar?: File }} data
   */
  createGroup: async (data) => {
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.description) {
      formData.append('description', data.description);
    }
    // Append member IDs array
    formData.append('memberIds', JSON.stringify(data.memberIds));

    if (data.avatar) {
      formData.append('avatar', data.avatar);
    }

    const response = await api.post('/groups', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Get group details.
   * @param {string} groupId
   */
  getGroupDetails: async (groupId) => {
    const response = await api.get(`/groups/${groupId}`);
    return response.data;
  },

  /**
   * Update group details (name, description, avatar).
   * @param {string} groupId
   * @param {{ name?: string, description?: string, avatar?: File }} data
   */
  updateGroup: async (groupId, data) => {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.description !== undefined) formData.append('description', data.description);
    if (data.avatar) formData.append('avatar', data.avatar);

    const response = await api.patch(`/groups/${groupId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Delete group.
   * @param {string} groupId
   */
  deleteGroup: async (groupId) => {
    const response = await api.delete(`/groups/${groupId}`);
    return response.data;
  },

  /**
   * Add members to group.
   * @param {string} groupId
   * @param {string[]} userIds
   */
  addMembers: async (groupId, userIds) => {
    const response = await api.post(`/groups/${groupId}/members`, { userIds });
    return response.data;
  },

  /**
   * Remove member / Kick or Leave.
   * @param {string} groupId
   * @param {string} userId
   */
  removeMember: async (groupId, userId) => {
    const response = await api.delete(`/groups/${groupId}/members/${userId}`);
    return response.data;
  },

  /**
   * Promote member to admin.
   * @param {string} groupId
   * @param {string} userId
   */
  promoteToAdmin: async (groupId, userId) => {
    const response = await api.patch(`/groups/${groupId}/promote`, { userId });
    return response.data;
  },

  /**
   * Demote admin to regular member.
   * @param {string} groupId
   * @param {string} userId
   */
  demoteFromAdmin: async (groupId, userId) => {
    const response = await api.patch(`/groups/${groupId}/demote`, { userId });
    return response.data;
  },

  /**
   * Regenerate invite link code with expiry selection.
   * @param {string} groupId
   * @param {'never'|'24h'|'7d'|'30d'} expiry
   */
  regenerateInviteCode: async (groupId, expiry = 'never') => {
    const response = await api.post('/groups/invite/regenerate', { groupId, expiry });
    return response.data;
  },

  /**
   * Join a group using invite code.
   * @param {string} inviteCode
   */
  joinGroupWithInvite: async (inviteCode) => {
    const response = await api.post('/groups/join', { inviteCode });
    return response.data;
  },
};

export default groupService;
export { groupService };
