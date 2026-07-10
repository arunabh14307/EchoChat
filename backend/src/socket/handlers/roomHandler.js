import { SOCKET_EVENTS } from '../socketEvents.js';

/**
 * roomHandler — manages joining/leaving conversation rooms.
 *
 * Socket.io rooms are keyed by conversationId.
 * A client must JOIN a room to receive its real-time events.
 *
 * @param {import('socket.io').Server} io
 * @param {import('socket.io').Socket} socket
 */
export const roomHandler = (io, socket) => {
  // ── Join a conversation room ───────────────────────────────
  socket.on(SOCKET_EVENTS.JOIN_CONVERSATION, ({ conversationId }) => {
    if (!conversationId) {
      return;
    }
    socket.join(conversationId);
  });

  // ── Leave a conversation room ──────────────────────────────
  socket.on(SOCKET_EVENTS.LEAVE_CONVERSATION, ({ conversationId }) => {
    if (!conversationId) {
      return;
    }
    socket.leave(conversationId);
  });
};
