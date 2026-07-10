import { SOCKET_EVENTS } from '../socketEvents.js';

/**
 * presenceHandler — manages online/offline user tracking.
 *
 * Maintains a server-side Map of userId → Set<socketId> to support
 * multiple sessions per user (e.g. desktop + mobile tabs).
 *
 * @param {import('socket.io').Server} io
 * @param {import('socket.io').Socket} socket
 * @param {Map<string, Set<string>>} onlineUsers - Shared Map across all sockets
 */
export const presenceHandler = (io, socket, onlineUsers) => {
  const userId = socket.userId;

  // ── User connects ──────────────────────────────────────────
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }
  onlineUsers.get(userId).add(socket.id);

  // Broadcast new online user to everyone
  socket.broadcast.emit(SOCKET_EVENTS.USER_ONLINE, { userId });

  // Send current online users list to the connecting client
  socket.emit(SOCKET_EVENTS.ONLINE_USERS, Array.from(onlineUsers.keys()));

  // ── User disconnects ───────────────────────────────────────
  socket.on('disconnect', () => {
    const sessions = onlineUsers.get(userId);
    if (sessions) {
      sessions.delete(socket.id);
      // Only broadcast offline if ALL sessions are closed
      if (sessions.size === 0) {
        onlineUsers.delete(userId);
        io.emit(SOCKET_EVENTS.USER_OFFLINE, { userId });
      }
    }
  });

  // ── Get current online users ───────────────────────────────
  socket.on(SOCKET_EVENTS.GET_ONLINE_USERS, () => {
    socket.emit(SOCKET_EVENTS.ONLINE_USERS, Array.from(onlineUsers.keys()));
  });
};
