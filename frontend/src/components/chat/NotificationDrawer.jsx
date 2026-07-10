import React, { useEffect, useRef } from 'react';
import { X, CheckCheck, Trash2, BellOff, Loader2, MessageSquare, ShieldAlert } from 'lucide-react';
import { useNotificationStore } from '@store/notificationStore';
import { useChatStore } from '@store/chatStore';
import notificationService from '@services/notificationService';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { formatConversationTime } from '@utils/formatTime';
import toast from 'react-hot-toast';

/**
 * NotificationDrawer — Panel detailing past notification alerts.
 *
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void
 * }} props
 */
const NotificationDrawer = ({ isOpen, onClose }) => {
  const {
    notifications,
    hasMore,
    isLoading,
    unreadCount,
    setNotifications,
    appendNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    removeNotification,
    setLoading,
  } = useNotificationStore();

  const { setActiveConversation } = useChatStore();
  const pageRef = useRef(1);

  // Initial fetch
  useEffect(() => {
    if (!isOpen) return;

    pageRef.current = 1;
    const fetchInitial = async () => {
      setLoading(true);
      try {
        const { data } = await notificationService.getNotifications({ page: 1, limit: 15 });
        setNotifications(data.notifications, data.hasMore);
      } catch {
        toast.error('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchInitial();
  }, [isOpen]);

  const handleLoadMore = async () => {
    if (isLoading || !hasMore) return;

    pageRef.current += 1;
    setLoading(true);
    try {
      const { data } = await notificationService.getNotifications({ page: pageRef.current, limit: 15 });
      appendNotifications(data.notifications, data.hasMore);
    } catch {
      pageRef.current -= 1;
      toast.error('Failed to load older notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (e, id) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      markNotificationRead(id);
    } catch {
      toast.error('Failed to mark read');
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    try {
      await notificationService.markAllAsRead();
      markAllNotificationsRead();
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to clear notifications');
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(id);
      removeNotification(id);
      toast.success('Notification removed');
    } catch {
      toast.error('Failed to delete notification');
    }
  };

  const handleNotificationClick = async (n) => {
    // Mark as read immediately on backend
    if (!n.isRead) {
      try {
        await notificationService.markAsRead(n._id);
        markNotificationRead(n._id);
      } catch (err) {
        console.error(err);
      }
    }

    // Switch to target conversation
    if (n.conversation?._id) {
      setActiveConversation(n.conversation._id);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-surface-900 border-l border-surface-800 shadow-2xl flex flex-col z-50 animate-fade-left select-none">
      {/* Header */}
      <div className="p-4 border-b border-surface-800 flex items-center justify-between bg-surface-900/40 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-surface-50 uppercase tracking-wider">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span className="bg-primary-500 text-white text-3xs font-extrabold px-1.5 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="p-1 rounded hover:bg-surface-800 text-surface-400 hover:text-surface-200 transition-colors"
              title="Mark all as read"
            >
              <CheckCheck className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-surface-800 text-surface-400 hover:text-surface-200 transition-colors"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* History listing */}
      <div className="flex-1 overflow-y-auto px-3.5 py-3 flex flex-col gap-2 scroll-hidden select-text">
        {notifications.length > 0 ? (
          <div className="flex flex-col gap-2 min-h-0">
            {notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => handleNotificationClick(n)}
                className={`
                  relative p-3 rounded-xl border flex flex-col gap-1.5 cursor-pointer transition-all duration-200
                  ${
                    n.isRead
                      ? 'bg-surface-900/40 border-surface-850 text-surface-300 hover:bg-surface-800/40'
                      : 'bg-surface-800/60 border-primary-500/20 text-surface-50 hover:bg-surface-800 hover:border-primary-500/35 shadow-glow-sm'
                  }
                `}
              >
                {/* Unread indicator dot */}
                {!n.isRead && (
                  <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-primary-500" />
                )}

                <div className="flex items-center gap-2.5 min-w-0 pr-4">
                  <Avatar
                    src={n.sender?.avatar?.url}
                    username={n.sender?.displayName || n.sender?.username || 'System'}
                    size="xs"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold truncate leading-tight">
                      {n.title}
                    </span>
                    <span className="text-3xs text-surface-500 mt-0.5 font-medium">
                      {formatConversationTime(n.createdAt)}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-surface-400 line-clamp-2 leading-relaxed break-words pl-0.5">
                  {n.body}
                </p>

                {/* Toolbar */}
                <div className="flex justify-end gap-2 border-t border-surface-800/40 pt-2 select-none">
                  {!n.isRead && (
                    <button
                      onClick={(e) => handleMarkRead(e, n._id)}
                      className="text-3xs font-semibold text-primary-400 hover:text-primary-300 transition-colors"
                    >
                      Mark Read
                    </button>
                  )}
                  <button
                    onClick={(e) => handleDelete(e, n._id)}
                    className="p-1 text-surface-500 hover:text-danger-400 hover:bg-danger-950/20 rounded transition-colors"
                    title="Delete alert"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {/* Pagination trigger button */}
            {hasMore && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLoadMore}
                loading={isLoading}
                className="w-full justify-center py-2 text-2xs text-surface-400 hover:text-white"
              >
                Load older notifications
              </Button>
            )}
          </div>
        ) : isLoading ? (
          <div className="m-auto flex flex-col items-center gap-2 text-surface-500 py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
            <span className="text-xs">Loading alerts...</span>
          </div>
        ) : (
          <div className="m-auto flex flex-col items-center gap-2 select-none text-surface-500 text-center py-12 max-w-xs">
            <BellOff className="w-8 h-8 opacity-45" />
            <p className="text-sm font-sans">You have no notifications</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDrawer;
export { NotificationDrawer };
