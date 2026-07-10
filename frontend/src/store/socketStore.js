import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * Socket Store — holds the Socket.io instance and real-time presence data.
 *
 * The socket is NOT serializable, so it's stored in memory only (no persist).
 */
export const useSocketStore = create(
  devtools(
    (set) => ({
      // ── State ────────────────────────────────────────────
      socket: null,           // Socket.io client instance
      isConnected: false,
      onlineUserIds: [],      // Array<string> of currently-online user IDs
      typingUsers: {},        // Record<conversationId, userId[]>

      // ── Actions ──────────────────────────────────────────
      setSocket: (socket) => set({ socket }, false, 'setSocket'),

      setConnected: (isConnected) => set({ isConnected }, false, 'setConnected'),

      setOnlineUsers: (onlineUserIds) =>
        set({ onlineUserIds }, false, 'setOnlineUsers'),

      addOnlineUser: (userId) =>
        set(
          (state) => ({
            onlineUserIds: state.onlineUserIds.includes(userId)
              ? state.onlineUserIds
              : [...state.onlineUserIds, userId],
          }),
          false,
          'addOnlineUser'
        ),

      removeOnlineUser: (userId) =>
        set(
          (state) => ({
            onlineUserIds: state.onlineUserIds.filter((id) => id !== userId),
          }),
          false,
          'removeOnlineUser'
        ),

      setTyping: (conversationId, userId, isTyping) =>
        set(
          (state) => {
            const current = state.typingUsers[conversationId] || [];
            const updated = isTyping
              ? current.includes(userId) ? current : [...current, userId]
              : current.filter((id) => id !== userId);
            return {
              typingUsers: { ...state.typingUsers, [conversationId]: updated },
            };
          },
          false,
          'setTyping'
        ),

      disconnectSocket: () =>
        set({ socket: null, isConnected: false, onlineUserIds: [] }, false, 'disconnectSocket'),
    }),
    { name: 'SocketStore' }
  )
);
