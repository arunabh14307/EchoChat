import Conversation from '../../models/Conversation.model.js';
import User from '../../models/User.model.js';
import ApiError from '../../utils/ApiError.js';

/**
 * findOrCreateConversation — Create a new 1-to-1 conversation if not exists.
 *
 * @param {string} userId — Current logged-in user
 * @param {string} recipientId — Selected user ID
 * @returns {Promise<Conversation>}
 */
export const findOrCreateConversation = async (userId, recipientId) => {
  if (userId === recipientId) {
    throw ApiError.badRequest('You cannot start a conversation with yourself');
  }

  // 1. Verify recipient exists
  const recipient = await User.findById(recipientId);
  if (!recipient) {
    throw ApiError.notFound('Recipient user not found');
  }

  // 2. Check if direct chat already exists
  let conversation = await Conversation.findOne({
    type: 'direct',
    participants: { $all: [userId, recipientId], $size: 2 },
  })
    .populate('participants')
    .populate('lastMessage');

  if (conversation) {
    return conversation;
  }

  // 3. Create new direct chat
  const newChat = await Conversation.create({
    type: 'direct',
    participants: [userId, recipientId],
    createdBy: userId,
    unreadCounts: [
      { user: userId, count: 0 },
      { user: recipientId, count: 0 },
    ],
  });

  // Fetch populated object to return
  return await Conversation.findById(newChat._id)
    .populate('participants')
    .populate('lastMessage');
};

/**
 * getUserConversations — Get all conversations for a user, sorted:
 * 1. Pinned
 * 2. Latest message
 * 3. Alphabetically (by recipient's name)
 *
 * @param {string} userId
 * @returns {Promise<Conversation[]>}
 */
export const getUserConversations = async (userId, archived = false) => {
  const conversations = await Conversation.find({
    participants: userId,
    archivedBy: archived ? userId : { $ne: userId }, // Toggle active vs archived chats
  })
    .populate('participants')
    .populate('lastMessage');

  // Custom sort implementation matching business logic
  conversations.sort((a, b) => {
    const aPinned = a.pinnedBy.some((id) => id.toString() === userId.toString());
    const bPinned = b.pinnedBy.some((id) => id.toString() === userId.toString());

    if (aPinned && !bPinned) {
      return -1;
    }
    if (!aPinned && bPinned) {
      return 1;
    }

    const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
    const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
    if (bTime !== aTime) {
      return bTime - aTime;
    }

    // Alphabetical sort on partner's display name or username
    const aPartner = a.participants.find((p) => p._id.toString() !== userId.toString());
    const bPartner = b.participants.find((p) => p._id.toString() !== userId.toString());
    const aName = aPartner ? (aPartner.displayName || aPartner.username).toLowerCase() : '';
    const bName = bPartner ? (bPartner.displayName || bPartner.username).toLowerCase() : '';
    return aName.localeCompare(bName);
  });

  return conversations;
};

/**
 * getConversationById — Get conversation details by ID if user is participant.
 *
 * @param {string} conversationId
 * @param {string} userId
 * @returns {Promise<Conversation>}
 */
export const getConversationById = async (conversationId, userId) => {
  const conversation = await Conversation.findById(conversationId)
    .populate('participants')
    .populate('lastMessage');

  if (!conversation) {
    throw ApiError.notFound('Conversation not found');
  }

  const isParticipant = conversation.participants.some(
    (p) => p._id.toString() === userId.toString()
  );

  if (!isParticipant) {
    throw ApiError.forbidden('You are not a participant in this conversation');
  }

  return conversation;
};

/**
 * pinConversation — Toggle pinned status for a user.
 *
 * @param {string} conversationId
 * @param {string} userId
 * @param {boolean} pinState
 * @returns {Promise<Conversation>}
 */
export const pinConversation = async (conversationId, userId, pinState) => {
  const update = pinState
    ? { $addToSet: { pinnedBy: userId } }
    : { $pull: { pinnedBy: userId } };

  const conversation = await Conversation.findByIdAndUpdate(conversationId, update, {
    new: true,
  })
    .populate('participants')
    .populate('lastMessage');

  if (!conversation) {
    throw ApiError.notFound('Conversation not found');
  }

  return conversation;
};

/**
 * muteConversation — Toggle mute status for a user.
 *
 * @param {string} conversationId
 * @param {string} userId
 * @param {boolean} muteState
 * @returns {Promise<Conversation>}
 */
export const muteConversation = async (conversationId, userId, muteState) => {
  const update = muteState
    ? { $addToSet: { mutedBy: userId } }
    : { $pull: { mutedBy: userId } };

  const conversation = await Conversation.findByIdAndUpdate(conversationId, update, {
    new: true,
  })
    .populate('participants')
    .populate('lastMessage');

  if (!conversation) {
    throw ApiError.notFound('Conversation not found');
  }

  return conversation;
};

/**
 * archiveConversation — Toggle archive status for a user.
 *
 * @param {string} conversationId
 * @param {string} userId
 * @param {boolean} archiveState
 * @returns {Promise<Conversation>}
 */
export const archiveConversation = async (conversationId, userId, archiveState) => {
  const update = archiveState
    ? { $addToSet: { archivedBy: userId } }
    : { $pull: { archivedBy: userId } };

  const conversation = await Conversation.findByIdAndUpdate(conversationId, update, {
    new: true,
  })
    .populate('participants')
    .populate('lastMessage');

  if (!conversation) {
    throw ApiError.notFound('Conversation not found');
  }

  return conversation;
};

/**
 * createGroup — Create group conversations.
 *
 * @param {{ name: string, memberIds: string[], adminId: string, avatar?: { url: string, publicId: string } }} data
 * @returns {Promise<Conversation>}
 */
export const createGroup = async ({ name, memberIds, adminId, avatar }) => {
  const allParticipants = Array.from(new Set([adminId, ...memberIds]));

  const newGroup = await Conversation.create({
    type: 'group',
    name,
    participants: allParticipants,
    admin: adminId,
    createdBy: adminId,
    groupAvatar: avatar || { url: '', publicId: '' },
    unreadCounts: allParticipants.map((id) => ({ user: id, count: 0 })),
  });

  return await Conversation.findById(newGroup._id)
    .populate('participants')
    .populate('lastMessage');
};
