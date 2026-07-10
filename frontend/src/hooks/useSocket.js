import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '@store/authStore';
import { useSocketStore } from '@store/socketStore';
import { useChatStore } from '@store/chatStore';
import { useNotificationStore } from '@store/notificationStore';
import { SOCKET_URL, SOCKET_EVENTS } from '@utils/constants';
import { playNotificationSound } from '@utils/audio';

/**
 * useSocket — manages the Socket.io connection lifecycle.
 *
 * - Connects when the user is authenticated.
 * - Registers global events (messages, presence, typing, notifications).
 * - Triggers audio and push notifications based on preferences.
 */
export const useSocket = () => {
  const { user, accessToken } = useAuthStore();
  const { setSocket, setConnected, setOnlineUsers, addOnlineUser, removeOnlineUser, setTyping } =
    useSocketStore();
  const {
    addMessage,
    updateMessage,
    updateConversation,
    activeConversationId,
  } = useChatStore();

  const {
    addNotification,
    markNotificationRead,
    markAllNotificationsRead,
  } = useNotificationStore();

  const socketRef = useRef(null);
  const activeChatRef = useRef(null);

  // Request browser Notification permissions once on mounting
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'default'
    ) {
      Notification.requestPermission();
    }
  }, []);

  // ── Connection lifecycle & event listeners ─────────────────
  useEffect(() => {
    if (!user || !accessToken) {
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { token: accessToken },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
    });

    socketRef.current = socket;
    setSocket(socket);

    socket.on(SOCKET_EVENTS.CONNECT, () => {
      setConnected(true);
      console.info('[Socket] Connected:', socket.id);

      if (activeChatRef.current) {
        socket.emit(SOCKET_EVENTS.JOIN_CONVERSATION, {
          conversationId: activeChatRef.current,
        });
      }
    });

    socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
      setConnected(false);
      console.info('[Socket] Disconnected:', reason);
    });

    // ── Presence ────────────────────────────────────────────
    socket.on(SOCKET_EVENTS.ONLINE_USERS, (userIds) => {
      setOnlineUsers(userIds);
    });

    socket.on(SOCKET_EVENTS.USER_ONLINE, ({ userId }) => {
      addOnlineUser(userId);
    });

    socket.on(SOCKET_EVENTS.USER_OFFLINE, ({ userId }) => {
      removeOnlineUser(userId);
    });

    // ── Incoming messages ───────────────────────────────────
    socket.on(SOCKET_EVENTS.NEW_MESSAGE, ({ message }) => {
      addMessage(message.conversation, message);

      updateConversation(message.conversation, {
        lastMessage: message,
        lastMessageAt: message.createdAt,
        updatedAt: message.createdAt,
      });
    });

    // ── Message edits/deletes ───────────────────────────────
    socket.on('message_updated', ({ message }) => {
      updateMessage(message.conversation, message._id, message);
    });

    socket.on('message_deleted', ({ messageId, conversationId }) => {
      updateMessage(conversationId, messageId, {
        content: 'This message was deleted',
        deletedForEveryone: true,
      });
    });

    // ── Typing ──────────────────────────────────────────────
    socket.on(SOCKET_EVENTS.USER_TYPING, ({ conversationId, userId, isTyping }) => {
      setTyping(conversationId, userId, isTyping);
    });

    // ── Notifications ───────────────────────────────────────
    socket.on('notification_received', ({ notification }) => {
      addNotification(notification);

      const prefs = user?.notificationSettings || {
        enableSound: true,
        enableBrowser: true,
        doNotDisturb: false,
      };

      if (prefs.doNotDisturb) {
        return;
      }

      // Play audio notification ping
      if (prefs.enableSound) {
        playNotificationSound();
      }

      // Trigger Web Push Notification if backgrounded
      if (
        prefs.enableBrowser &&
        'Notification' in window &&
        Notification.permission === 'granted' &&
        !document.hasFocus()
      ) {
        new Notification(notification.title, {
          body: notification.body,
          icon: '/favicon.svg',
          tag: notification.conversation?._id || 'echochat',
        });
      }
    });

    socket.on('notification_read', ({ notificationId }) => {
      markNotificationRead(notificationId);
    });

    socket.on('all_notifications_read', () => {
      markAllNotificationsRead();
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [user?._id, accessToken]);

  // ── Dynamic Room Membership (Join/Leave active chat) ───────
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) {
      activeChatRef.current = activeConversationId;
      return;
    }

    const prevChat = activeChatRef.current;
    const nextChat = activeConversationId;

    if (prevChat === nextChat) {
      return;
    }

    if (prevChat) {
      socket.emit(SOCKET_EVENTS.LEAVE_CONVERSATION, { conversationId: prevChat });
    }

    if (nextChat) {
      socket.emit(SOCKET_EVENTS.JOIN_CONVERSATION, { conversationId: nextChat });
    }

    activeChatRef.current = nextChat;
  }, [activeConversationId, socketRef.current?.connected]);

  return socketRef.current;
};
