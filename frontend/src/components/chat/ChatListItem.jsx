import React, { memo } from 'react';
import { Pin, VolumeX, Archive, Trash2, MoreVertical } from 'lucide-react';
import { useAuthStore } from '@store/authStore';
import { useSocketStore } from '@store/socketStore';
import { formatConversationTime } from '@utils/formatTime';
import Avatar from '../ui/Avatar';
import Dropdown from '../ui/Dropdown';
import chatService from '@services/chatService';
import { useChatStore } from '@store/chatStore';
import toast from 'react-hot-toast';

/**
 * ChatListItem — displays a single conversation card with options to pin, mute, archive and delete.
 *
 * @param {{
 *   conversation: import('@types/conversation.types').Conversation,
 *   isActive: boolean,
 *   onSelect: () => void
 * }} props
 */
const ChatListItem = ({ conversation, isActive, onSelect }) => {
  const { user: currentUser } = useAuthStore();
  const { onlineUserIds } = useSocketStore();
  const { updateConversation, removeConversation } = useChatStore();

  const isGroup = conversation.type === 'group';

  // Identify conversation partner
  const partner = isGroup
    ? null
    : conversation.participants.find((p) => p._id !== currentUser?._id);

  const displayName = isGroup ? conversation.name : partner?.displayName || partner?.username || 'User';
  const avatarUrl = isGroup ? conversation.groupAvatar?.url : partner?.avatar?.url;
  const username = isGroup ? 'group' : partner?.username;
  const isOnline = isGroup ? false : onlineUserIds.includes(partner?._id);

  // Per-user toggles
  const isPinned = conversation.pinnedBy?.includes(currentUser?._id);
  const isMuted = conversation.mutedBy?.includes(currentUser?._id);

  // Unread count
  const unreadObj = conversation.unreadCounts?.find((u) => u.user === currentUser?._id);
  const unreadCount = unreadObj ? unreadObj.count : 0;

  // Last message snippet
  const lastMessageText = conversation.lastMessage
    ? conversation.lastMessage.messageType === 'image'
      ? '📷 Image'
      : conversation.lastMessage.messageType === 'video'
      ? '🎥 Video'
      : conversation.lastMessage.messageType === 'file'
      ? '📁 File'
      : conversation.lastMessage.content
    : 'No messages yet';

  const lastMessageTime = conversation.lastMessage
    ? formatConversationTime(conversation.lastMessage.createdAt)
    : formatConversationTime(conversation.updatedAt);

  // Action handlers
  const handlePin = async (e) => {
    try {
      const nextState = !isPinned;
      await chatService.pinConversation(conversation._id, nextState);
      updateConversation(conversation._id, {
        pinnedBy: nextState
          ? [...(conversation.pinnedBy || []), currentUser?._id]
          : (conversation.pinnedBy || []).filter((id) => id !== currentUser?._id),
      });
      toast.success(nextState ? 'Conversation pinned' : 'Conversation unpinned');
    } catch {
      toast.error('Failed to update conversation pin');
    }
  };

  const handleMute = async (e) => {
    try {
      const nextState = !isMuted;
      await chatService.muteConversation(conversation._id, nextState);
      updateConversation(conversation._id, {
        mutedBy: nextState
          ? [...(conversation.mutedBy || []), currentUser?._id]
          : (conversation.mutedBy || []).filter((id) => id !== currentUser?._id),
      });
      toast.success(nextState ? 'Conversation muted' : 'Conversation unmuted');
    } catch {
      toast.error('Failed to update conversation mute');
    }
  };

  const handleArchive = async (e) => {
    try {
      await chatService.archiveConversation(conversation._id, true);
      removeConversation(conversation._id);
      toast.success('Conversation archived');
    } catch {
      toast.error('Failed to archive conversation');
    }
  };

  const handleDelete = async (e) => {
    try {
      await chatService.deleteConversation(conversation._id);
      removeConversation(conversation._id);
      toast.success('Conversation hidden');
    } catch {
      toast.error('Failed to hide conversation');
    }
  };

  const actionItems = [
    {
      label: isPinned ? 'Unpin Chat' : 'Pin Chat',
      icon: <Pin className="w-4 h-4" />,
      onClick: handlePin,
    },
    {
      label: isMuted ? 'Unmute Chat' : 'Mute Chat',
      icon: <VolumeX className="w-4 h-4" />,
      onClick: handleMute,
    },
    {
      label: 'Archive Chat',
      icon: <Archive className="w-4 h-4" />,
      onClick: handleArchive,
    },
    {
      label: 'Delete Chat',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: handleDelete,
      variant: 'danger',
    },
  ];

  return (
    <div
      onClick={onSelect}
      className={`
        flex items-center gap-3 p-3.5 rounded-xl cursor-pointer select-none transition-all duration-200 border
        ${
          isActive
            ? 'bg-surface-800 border-surface-700 shadow-glow-sm'
            : 'bg-surface-900/40 hover:bg-surface-800/40 border-transparent hover:border-surface-800/40'
        }
      `}
    >
      {/* Avatar presence display */}
      <Avatar
        src={avatarUrl}
        username={displayName}
        status={isOnline ? 'online' : null}
        size="md"
      />

      {/* Message Info preview details */}
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <div className="flex justify-between items-baseline gap-1">
          <span className="text-sm font-semibold text-surface-50 truncate">
            {displayName}
          </span>
          <span className="text-2xs text-surface-500 shrink-0">
            {lastMessageTime}
          </span>
        </div>
        <div className="flex justify-between items-center gap-1.5 mt-0.5">
          <span className="text-xs text-surface-400 truncate flex-1 leading-tight">
            {lastMessageText}
          </span>

          <div className="flex items-center gap-1.5 shrink-0">
            {isPinned && <Pin className="w-3 h-3 text-primary-400 rotate-45" />}
            {isMuted && <VolumeX className="w-3 h-3 text-surface-500" />}
            {unreadCount > 0 && (
              <span className="bg-primary-500 text-white text-2xs font-semibold px-1.5 py-0.5 rounded-full flex-center shrink-0 min-w-4.5 min-h-4.5">
                {unreadCount}
              </span>
            )}
            <Dropdown
              trigger={
                <button
                  type="button"
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 rounded hover:bg-surface-700/50 text-surface-500 hover:text-surface-300 transition-colors"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
              }
              items={actionItems}
              position="bottom-right"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(ChatListItem);
export { ChatListItem };
