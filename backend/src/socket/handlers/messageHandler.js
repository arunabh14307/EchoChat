import { SOCKET_EVENTS } from '../socketEvents.js';

/**
 * messageHandler — handles real-time typing events and read receipts over socket.
 *
 * Note: Actual message SENDING happens via the REST API (POST /api/messages).
 * The REST handler emits NEW_MESSAGE to the socket room after saving.
 * This handler manages the secondary real-time events.
 *
 * @param {import('socket.io').Server} io
 * @param {import('socket.io').Socket} socket
 */
export const messageHandler = (io, socket) => {
  const userId = socket.userId;

  // ── Typing indicators ──────────────────────────────────────
  socket.on(SOCKET_EVENTS.TYPING_START, ({ conversationId }) => {
    if (!conversationId) {
      return;
    }
    socket.to(conversationId).emit(SOCKET_EVENTS.USER_TYPING, {
      conversationId,
      userId,
      isTyping: true,
    });
  });

  socket.on(SOCKET_EVENTS.TYPING_STOP, ({ conversationId }) => {
    if (!conversationId) {
      return;
    }
    socket.to(conversationId).emit(SOCKET_EVENTS.USER_TYPING, {
      conversationId,
      userId,
      isTyping: false,
    });
  });

  // ── Read receipts ──────────────────────────────────────────
  socket.on(SOCKET_EVENTS.MESSAGE_READ, ({ conversationId, messageIds }) => {
    if (!conversationId || !messageIds?.length) {
      return;
    }
    socket.to(conversationId).emit(SOCKET_EVENTS.MESSAGES_READ, {
      conversationId,
      messageIds,
      userId,
    });
  });
};
