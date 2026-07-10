import * as conversationService from './conversation.service.js';
import ApiResponse from '../../utils/ApiResponse.js';

// ── POST /api/conversations ────────────────────────────────────
export const createOrGetConversation = async (req, res, next) => {
  try {
    const conversation = await conversationService.findOrCreateConversation(
      req.user.userId,
      req.body.recipientId
    );

    res.status(200).json(
      new ApiResponse(200, 'Conversation initialized successfully', { conversation })
    );
  } catch (error) {
    next(error);
  }
};

// ── GET /api/conversations ─────────────────────────────────────
export const getConversations = async (req, res, next) => {
  try {
    const isArchived = req.query.archived === 'true';
    const conversations = await conversationService.getUserConversations(req.user.userId, isArchived);

    res.status(200).json(
      new ApiResponse(200, 'Conversations retrieved successfully', { conversations })
    );
  } catch (error) {
    next(error);
  }
};

// ── GET /api/conversations/:conversationId ─────────────────────
export const getConversationById = async (req, res, next) => {
  try {
    const conversation = await conversationService.getConversationById(
      req.params.conversationId,
      req.user.userId
    );

    res.status(200).json(
      new ApiResponse(200, 'Conversation details fetched successfully', { conversation })
    );
  } catch (error) {
    next(error);
  }
};

// ── PATCH /api/conversations/:conversationId/pin ───────────────
export const pinConversation = async (req, res, next) => {
  try {
    const conversation = await conversationService.pinConversation(
      req.params.conversationId,
      req.user.userId,
      req.body.state
    );

    res.status(200).json(
      new ApiResponse(200, `Conversation ${req.body.state ? 'pinned' : 'unpinned'} successfully`, {
        conversation,
      })
    );
  } catch (error) {
    next(error);
  }
};

// ── PATCH /api/conversations/:conversationId/mute ──────────────
export const muteConversation = async (req, res, next) => {
  try {
    const conversation = await conversationService.muteConversation(
      req.params.conversationId,
      req.user.userId,
      req.body.state
    );

    res.status(200).json(
      new ApiResponse(200, `Conversation ${req.body.state ? 'muted' : 'unmuted'} successfully`, {
        conversation,
      })
    );
  } catch (error) {
    next(error);
  }
};

// ── PATCH /api/conversations/:conversationId/archive ───────────
export const archiveConversation = async (req, res, next) => {
  try {
    const conversation = await conversationService.archiveConversation(
      req.params.conversationId,
      req.user.userId,
      req.body.state
    );

    res.status(200).json(
      new
      ApiResponse(200, `Conversation ${req.body.state ? 'archived' : 'unarchived'} successfully`, {
        conversation,
      })
    );
  } catch (error) {
    next(error);
  }
};

// ── DELETE /api/conversations/:conversationId ──────────────────
// Soft delete / Hide conversation for current user (archives it)
export const deleteConversation = async (req, res, next) => {
  try {
    const conversation = await conversationService.archiveConversation(
      req.params.conversationId,
      req.user.userId,
      true
    );

    res.status(200).json(
      new ApiResponse(200, 'Conversation soft-deleted/hidden successfully', { conversation })
    );
  } catch (error) {
    next(error);
  }
};

// ── POST /api/conversations/group ──────────────────────────────
export const createGroupConversation = async (req, res, next) => {
  try {
    const { name, memberIds } = req.body;
    let avatar = { url: '', publicId: '' };

    if (req.file) {
      avatar = { url: req.file.path, publicId: req.file.filename };
    }

    const conversation = await conversationService.createGroup({
      name,
      memberIds,
      adminId: req.user.userId,
      avatar,
    });

    res.status(201).json(
      new ApiResponse(201, 'Group conversation created successfully', { conversation })
    );
  } catch (error) {
    next(error);
  }
};
