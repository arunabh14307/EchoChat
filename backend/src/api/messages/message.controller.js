import * as messageService from './message.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import ApiError from '../../utils/ApiError.js';
import { SOCKET_EVENTS } from '../../socket/socketEvents.js';
import { handleMessageNotifications } from '../notifications/notification.controller.js';

// ── POST /api/messages ─────────────────────────────────────────
export const sendMessage = async (req, res, next) => {
  try {
    const { conversationId, content, replyTo } = req.body;

    const message = await messageService.createMessage({
      conversationId,
      senderId: req.user.userId,
      content,
      replyTo,
    });

    // Broadcast new message via Socket.io to the room
    req.io.to(conversationId).emit(SOCKET_EVENTS.NEW_MESSAGE, { message });

    // Trigger user notification updates
    handleMessageNotifications(req.io, message, req.user.userId);

    res.status(201).json(
      new ApiResponse(201, 'Message sent successfully', { message })
    );
  } catch (error) {
    next(error);
  }
};

// ── GET /api/messages/:conversationId ──────────────────────────
export const getMessages = async (req, res, next) => {
  try {
    const conversationId = req.params.conversationId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 40;

    const { messages, hasMore } = await messageService.fetchMessages(
      conversationId,
      req.user.userId,
      page,
      limit
    );

    res.status(200).json(
      new ApiResponse(200, 'Messages loaded successfully', { messages, hasMore })
    );
  } catch (error) {
    next(error);
  }
};

// ── PATCH /api/messages/:id ────────────────────────────────────
export const editMessage = async (req, res, next) => {
  try {
    const messageId = req.params.id;
    const { content } = req.body;

    const message = await messageService.updateMessage(
      messageId,
      req.user.userId,
      content
    );

    // Broadcast update via Socket.io
    req.io.to(message.conversation.toString()).emit('message_updated', { message });

    res.status(200).json(
      new ApiResponse(200, 'Message edited successfully', { message })
    );
  } catch (error) {
    next(error);
  }
};

// ── DELETE /api/messages/:id ───────────────────────────────────
// Delete for Everyone
export const deleteMessageForEveryone = async (req, res, next) => {
  try {
    const messageId = req.params.id;

    const message = await messageService.deleteMessageForEveryone(
      messageId,
      req.user.userId
    );

    // Broadcast delete event via Socket.io
    req.io.to(message.conversation.toString()).emit('message_deleted', {
      messageId: message._id,
      conversationId: message.conversation,
    });

    res.status(200).json(
      new ApiResponse(200, 'Message deleted for everyone successfully', { message })
    );
  } catch (error) {
    next(error);
  }
};

// ── DELETE /api/messages/:id/me ────────────────────────────────
// Delete for Me
export const deleteMessageForMe = async (req, res, next) => {
  try {
    const messageId = req.params.id;

    const message = await messageService.deleteMessageForMe(
      messageId,
      req.user.userId
    );

    res.status(200).json(
      new ApiResponse(200, 'Message deleted for you successfully', { message })
    );
  } catch (error) {
    next(error);
  }
};

// ── PATCH /api/messages/:conversationId/read ───────────────────
export const markAsRead = async (req, res, next) => {
  try {
    const conversationId = req.params.conversationId;

    await messageService.markMessagesRead(conversationId, req.user.userId);

    // Broadcast seen event
    req.io.to(conversationId).emit(SOCKET_EVENTS.MESSAGES_READ, {
      conversationId,
      userId: req.user.userId,
    });

    res.status(200).json(new ApiResponse(200, 'Messages marked as read'));
  } catch (error) {
    next(error);
  }
};

// ── POST /api/messages/media ───────────────────────────────────
export const sendMediaMessage = async (req, res, next) => {
  try {
    const { conversationId, content, replyTo } = req.body;

    if (!req.file) {
      throw ApiError.badRequest('No media file attachment provided');
    }

    const fileData = {
      url: req.file.path,
      publicId: req.file.filename,
      name: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
    };

    const message = await messageService.createMediaMessage({
      conversationId,
      senderId: req.user.userId,
      fileData,
      content,
      replyTo,
    });

    // Broadcast new message via Socket.io
    req.io.to(conversationId).emit(SOCKET_EVENTS.NEW_MESSAGE, { message });

    // Trigger user notification updates
    handleMessageNotifications(req.io, message, req.user.userId);

    res.status(201).json(
      new ApiResponse(201, 'Media message sent successfully', { message })
    );
  } catch (error) {
    next(error);
  }
};
