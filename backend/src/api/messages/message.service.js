import Message from '../../models/Message.model.js';
import Conversation from '../../models/Conversation.model.js';
import ApiError from '../../utils/ApiError.js';

/**
 * createMessage — Persist a text message in DB and update conversation metadata.
 *
 * @param {{ conversationId: string, senderId: string, content: string, replyTo?: string }} data
 * @returns {Promise<Message>}
 */
export const createMessage = async ({ conversationId, senderId, content, replyTo }) => {
  // 1. Verify conversation exists and user is participant
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw ApiError.notFound('Conversation not found');
  }

  const isParticipant = conversation.participants.some(
    (p) => p.toString() === senderId.toString()
  );
  if (!isParticipant) {
    throw ApiError.forbidden('You are not a participant in this conversation');
  }

  // 2. Create message
  const message = await Message.create({
    conversation: conversationId,
    sender: senderId,
    content,
    replyTo: replyTo || null,
    messageType: 'text',
    seenBy: [{ user: senderId, seenAt: new Date() }],
  });

  // 3. Update Conversation details & increment unread count for others
  conversation.lastMessage = message._id;
  conversation.lastMessageAt = message.createdAt;

  // Increment unread count for other participants
  conversation.unreadCounts = conversation.unreadCounts.map((unread) => {
    if (unread.user.toString() !== senderId.toString()) {
      return { user: unread.user, count: unread.count + 1 };
    }
    return unread;
  });

  // If conversation was archived by anyone, unarchive it since a new message is sent
  conversation.archivedBy = [];

  await conversation.save();

  // Populate references
  return await Message.findById(message._id)
    .populate('sender')
    .populate({
      path: 'replyTo',
      populate: { path: 'sender' },
    });
};

/**
 * fetchMessages — Get paginated messages for a conversation.
 * Returns older messages first, but fetched sorted by date descending.
 *
 * @param {string} conversationId
 * @param {string} userId
 * @param {number} [page=1]
 * @param {number} [limit=40]
 * @returns {Promise<{ messages: Message[], hasMore: boolean }>}
 */
export const fetchMessages = async (conversationId, userId, page = 1, limit = 40) => {
  // 1. Check access
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw ApiError.notFound('Conversation not found');
  }

  const isParticipant = conversation.participants.some(
    (p) => p.toString() === userId.toString()
  );
  if (!isParticipant) {
    throw ApiError.forbidden('You are not a participant in this conversation');
  }

  // 2. Query messages
  const skip = (page - 1) * limit;

  const messages = await Message.find({
    conversation: conversationId,
    deletedForMe: { $ne: userId },
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('sender')
    .populate({
      path: 'replyTo',
      populate: { path: 'sender' },
    });

  const totalCount = await Message.countDocuments({
    conversation: conversationId,
    deletedForMe: { $ne: userId },
  });

  const hasMore = skip + messages.length < totalCount;

  // Return sorted ascending for chat timeline representation
  return {
    messages: messages.reverse(),
    hasMore,
  };
};

/**
 * updateMessage — Edit message content (only sender).
 *
 * @param {string} messageId
 * @param {string} userId
 * @param {string} content
 * @returns {Promise<Message>}
 */
export const updateMessage = async (messageId, userId, content) => {
  const message = await Message.findById(messageId);
  if (!message) {
    throw ApiError.notFound('Message not found');
  }

  if (message.sender.toString() !== userId.toString()) {
    throw ApiError.forbidden('You can only edit your own messages');
  }

  if (message.deletedForEveryone) {
    throw ApiError.badRequest('Cannot edit a deleted message');
  }

  message.content = content;
  message.edited = true;
  message.editedAt = new Date();

  await message.save();

  return await Message.findById(messageId)
    .populate('sender')
    .populate({
      path: 'replyTo',
      populate: { path: 'sender' },
    });
};

/**
 * deleteMessageForEveryone — Soft delete message for all members.
 *
 * @param {string} messageId
 * @param {string} userId
 * @returns {Promise<Message>}
 */
export const deleteMessageForEveryone = async (messageId, userId) => {
  const message = await Message.findById(messageId);
  if (!message) {
    throw ApiError.notFound('Message not found');
  }

  if (message.sender.toString() !== userId.toString()) {
    throw ApiError.forbidden('You can only delete your own messages');
  }

  message.content = 'This message was deleted';
  message.deletedForEveryone = true;
  await message.save();

  return await Message.findById(messageId)
    .populate('sender')
    .populate({
      path: 'replyTo',
      populate: { path: 'sender' },
    });
};

/**
 * deleteMessageForMe — Soft delete message only for current user.
 *
 * @param {string} messageId
 * @param {string} userId
 * @returns {Promise<Message>}
 */
export const deleteMessageForMe = async (messageId, userId) => {
  const message = await Message.findByIdAndUpdate(
    messageId,
    { $addToSet: { deletedForMe: userId } },
    { new: true }
  )
    .populate('sender')
    .populate({
      path: 'replyTo',
      populate: { path: 'sender' },
    });

  if (!message) {
    throw ApiError.notFound('Message not found');
  }

  return message;
};

/**
 * markMessagesRead — Update seenBy list and reset unread count.
 *
 * @param {string} conversationId
 * @param {string} userId
 */
export const markMessagesRead = async (conversationId, userId) => {
  // Update seen flag in all unread messages
  await Message.updateMany(
    {
      conversation: conversationId,
      sender: { $ne: userId },
      'seenBy.user': { $ne: userId },
    },
    {
      $addToSet: { seenBy: { user: userId, seenAt: new Date() } },
    }
  );

  // Reset unread count for this user in conversation
  await Conversation.updateOne(
    { _id: conversationId, 'unreadCounts.user': userId },
    { $set: { 'unreadCounts.$.count': 0 } }
  );
};

/**
 * createMediaMessage — Persist a media message (image, video, doc, zip) and update conversation.
 *
 * @param {{ conversationId: string, senderId: string, fileData: any, content?: string, replyTo?: string }} data
 * @returns {Promise<Message>}
 */
export const createMediaMessage = async ({
  conversationId,
  senderId,
  fileData,
  content,
  replyTo,
}) => {
  // 1. Verify access
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw ApiError.notFound('Conversation not found');
  }

  const isParticipant = conversation.participants.some(
    (p) => p.toString() === senderId.toString()
  );
  if (!isParticipant) {
    throw ApiError.forbidden('You are not a participant in this conversation');
  }

  // 2. Classify type
  let type = 'file';
  if (fileData.mimeType.startsWith('image/')) {
    type = 'image';
  } else if (fileData.mimeType.startsWith('video/')) {
    type = 'video';
  }

  // 3. Create message
  const message = await Message.create({
    conversation: conversationId,
    sender: senderId,
    content: content || '',
    replyTo: replyTo || null,
    messageType: type,
    media: fileData,
    seenBy: [{ user: senderId, seenAt: new Date() }],
  });

  // 4. Update Conversation Details
  conversation.lastMessage = message._id;
  conversation.lastMessageAt = message.createdAt;

  conversation.unreadCounts = conversation.unreadCounts.map((unread) => {
    if (unread.user.toString() !== senderId.toString()) {
      return { user: unread.user, count: unread.count + 1 };
    }
    return unread;
  });

  conversation.archivedBy = [];
  await conversation.save();

  return await Message.findById(message._id)
    .populate('sender')
    .populate({
      path: 'replyTo',
      populate: { path: 'sender' },
    });
};
