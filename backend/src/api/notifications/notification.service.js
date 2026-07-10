import Notification from '../../models/Notification.model.js';
import User from '../../models/User.model.js';
import Conversation from '../../models/Conversation.model.js';
import ApiError from '../../utils/ApiError.js';

/**
 * createNotification — Persists a notification if preferences (DND, mute settings) allow it.
 *
 * @param {{
 *   recipient: string,
 *   sender?: string,
 *   type: string,
 *   title: string,
 *   body: string,
 *   conversation: string,
 *   message?: string
 * }} data
 * @returns {Promise<Notification | null>}
 */
export const createNotification = async (data) => {
  const { recipient: recipientId, sender: senderId, type, title, body, conversation: conversationId, message: messageId } = data;

  // 1. Fetch recipient and settings
  const recipient = await User.findById(recipientId);
  if (!recipient) {
    return null;
  }

  const settings = recipient.notificationSettings || {
    enableSound: true,
    enableBrowser: true,
    doNotDisturb: false,
    muteGroups: false,
    muteDirect: false,
  };

  // Skip if Do Not Disturb is active
  if (settings.doNotDisturb) {
    return null;
  }

  // 2. Resolve conversation details for mute filters
  const conversation = await Conversation.findById(conversationId);
  if (conversation) {
    const isGroupChat = conversation.isGroup || conversation.type === 'group';
    if (isGroupChat && settings.muteGroups) {
      return null;
    }
    if (!isGroupChat && settings.muteDirect) {
      return null;
    }
  }

  // 3. Create and save notification
  const notification = await Notification.create({
    recipient: recipientId,
    sender: senderId || null,
    type,
    title,
    body,
    conversation: conversationId,
    message: messageId || null,
  });

  return await Notification.findById(notification._id)
    .populate('sender', 'username displayName avatar');
};

/**
 * getUserNotifications — Retrieve paginated notification records.
 */
export const getUserNotifications = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const notifications = await Notification.find({ recipient: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('sender', 'username displayName avatar')
    .populate('conversation', 'name type isGroup groupAvatar');

  const totalCount = await Notification.countDocuments({ recipient: userId });
  const hasMore = skip + notifications.length < totalCount;

  return {
    notifications,
    hasMore,
  };
};

/**
 * markAsRead — Flag a single notification.
 */
export const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { isRead: true, readAt: new Date() },
    { new: true }
  ).populate('sender', 'username displayName avatar');

  if (!notification) {
    throw ApiError.notFound('Notification not found');
  }

  return notification;
};

/**
 * markAllAsRead — Mark all user notifications.
 */
export const markAllAsRead = async (userId) => {
  await Notification.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

/**
 * deleteNotification — Remove a notification.
 */
export const deleteNotification = async (notificationId, userId) => {
  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    recipient: userId,
  });

  if (!notification) {
    throw ApiError.notFound('Notification not found');
  }

  return notification;
};
