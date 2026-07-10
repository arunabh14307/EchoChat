import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * Notification Store — manages notifications history, unread counters, and API sync states.
 */
export const useNotificationStore = create(
  devtools(
    (set, get) => ({
      // ── State ────────────────────────────────────────────
      notifications: [],
      unreadCount: 0,
      hasMore: true,
      isLoading: false,

      // ── Actions ──────────────────────────────────────────
      setNotifications: (notifications, hasMore) => {
        const unread = notifications.filter((n) => !n.isRead).length;
        set({ notifications, hasMore, unreadCount: unread }, false, 'setNotifications');
      },

      appendNotifications: (olderNotifications, hasMore) => {
        set(
          (state) => {
            const merged = [...state.notifications, ...olderNotifications];
            const unread = merged.filter((n) => !n.isRead).length;
            return {
              notifications: merged,
              hasMore,
              unreadCount: unread,
            };
          },
          false,
          'appendNotifications'
        );
      },

      addNotification: (notification) =>
        set(
          (state) => {
            // Deduplicate incoming
            const exists = state.notifications.some((n) => n._id === notification._id);
            if (exists) return {};

            const updated = [notification, ...state.notifications];
            return {
              notifications: updated,
              unreadCount: state.unreadCount + (notification.isRead ? 0 : 1),
            };
          },
          false,
          'addNotification'
        ),

      markNotificationRead: (notificationId) =>
        set(
          (state) => {
            const updated = state.notifications.map((n) =>
              n._id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
            );
            const count = updated.filter((n) => !n.isRead).length;
            return {
              notifications: updated,
              unreadCount: count,
            };
          },
          false,
          'markNotificationRead'
        ),

      markAllNotificationsRead: () =>
        set(
          (state) => {
            const updated = state.notifications.map((n) =>
              n.isRead ? n : { ...n, isRead: true, readAt: new Date().toISOString() }
            );
            return {
              notifications: updated,
              unreadCount: 0,
            };
          },
          false,
          'markAllNotificationsRead'
        ),

      removeNotification: (notificationId) =>
        set(
          (state) => {
            const target = state.notifications.find((n) => n._id === notificationId);
            const wasUnread = target ? !target.isRead : false;

            const updated = state.notifications.filter((n) => n._id !== notificationId);
            return {
              notifications: updated,
              unreadCount: state.unreadCount - (wasUnread ? 1 : 0),
            };
          },
          false,
          'removeNotification'
        ),

      setLoading: (isLoading) => set({ isLoading }, false, 'setLoading'),
    }),
    { name: 'NotificationStore' }
  )
);
