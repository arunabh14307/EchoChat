import * as notificationService from './notification.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import Conversation from '../../models/Conversation.model.js';
import User from '../../models/User.model.js';
import { getOnlineUsers } from '../../socket/index.js';

// ── GET /api/notifications ──────────────────────────────────────
export const getNotifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const { notifications, hasMore } = await notificationService.getUserNotifications(
      req.user.userId,
      page,
      limit
    );

    res.status(200).json(
      new ApiResponse(200, 'Notifications loaded successfully', { notifications, hasMore })
    );
  } catch (error) {
    next(error);
  }
};

// ── PATCH /api/notifications/:id/read ───────────────────────────
export const readNotification = async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(
      req.params.id,
      req.user.userId
    );

    // Sync state to all active socket sessions for this user
    if (req.io) {
      req.io.to(req.user.userId).emit('notification_read', {
        notificationId: notification._id,
      });
    }

    res.status(200).json(
      new ApiResponse(200, 'Notification marked as read', { notification })
    );
  } catch (error) {
    next(error);
  }
};

// ── PATCH /api/notifications/read-all ───────────────────────────
export const readAllNotifications = async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user.userId);

    // Sync state
    if (req.io) {
      req.io.to(req.user.userId).emit('all_notifications_read');
    }

    res.status(200).json(
      new ApiResponse(200, 'All notifications marked as read')
    );
  } catch (error) {
    next(error);
  }
};

// ── DELETE /api/notifications/:id ────────────────────────────────
export const removeNotification = async (req, res, next) => {
  try {
    const notification = await notificationService.deleteNotification(
      req.params.id,
      req.user.userId
    );

    res.status(200).json(
      new ApiResponse(200, 'Notification deleted successfully', {
        notificationId: notification._id,
      })
    );
  } catch (error) {
    next(error);
  }
};

// Helper utility to create and emit dynamic user notifications
export const triggerNotification = async (io, data) => {
  try {
    const notification = await notificationService.createNotification(data);
    if (notification && io) {
      io.to(data.recipient.toString()).emit('notification_received', { notification });
    }
    return notification;
  } catch (err) {
    console.error('[Notification Trigger Error]:', err);
    return null;
  }
};

// Orchestrates notifications for new messages, checking room states & mutes
export const handleMessageNotifications = async (io, message, senderId) => {
  try {
    const conversationId = message.conversation;
    const conversation = await Conversation.findById(conversationId).populate('participants');
    if (!conversation) return;

    const sender = await User.findById(senderId);
    const senderName = sender?.displayName || sender?.username || 'Someone';

    // Loop through all participants
    for (const participant of conversation.participants) {
      if (participant._id.toString() === senderId.toString()) {
        continue; // Skip sender
      }

      // Check if recipient is active in the Socket.io room
      const activeSocketsInRoom = io?.sockets?.adapter?.rooms?.get(conversationId.toString()) || new Set();
      const onlineUsers = getOnlineUsers();
      const participantSessions = onlineUsers.get(participant._id.toString()) || new Set();
      const isParticipantActiveInRoom = Array.from(participantSessions).some((sid) =>
        activeSocketsInRoom.has(sid)
      );

      // Skip notification if participant is active in the conversation room
      if (isParticipantActiveInRoom) {
        continue;
      }

      // Classify type
      let type = 'new_message';
      let title = conversation.isGroup ? `New message in ${conversation.name}` : senderName;
      let body = message.content || 'Sent an attachment';

      // Check for mention: @username
      const mentionPattern = new RegExp(`@${participant.username}\\b`, 'i');
      if (message.content && mentionPattern.test(message.content)) {
        type = 'mention';
        title = `Mentioned in ${conversation.isGroup ? conversation.name : 'chat'}`;
        body = `${senderName}: ${message.content}`;
      }
      // Check for reply
      else if (message.replyTo && message.replyTo.sender?.toString() === participant._id.toString()) {
        type = 'reply';
        title = 'Replied to your message';
        body = `${senderName}: ${message.content}`;
      }

      await triggerNotification(io, {
        recipient: participant._id,
        sender: senderId,
        type,
        title,
        body,
        conversation: conversationId,
        message: message._id,
      });
    }
  } catch (err) {
    console.error('[Message Notification Setup Error]:', err);
  }
};
