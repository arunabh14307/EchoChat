import React, { memo } from 'react';
import { ArrowLeft, Phone, Video, MoreVertical, ShieldAlert, FolderClosed } from 'lucide-react';
import { useAuthStore } from '@store/authStore';
import { useSocketStore } from '@store/socketStore';
import { useChatStore } from '@store/chatStore';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { formatLastSeen } from '@utils/formatTime';

/**
 * ChatHeader — renders active conversation partner details, presence indicator subtitle, and call buttons.
 *
 * @param {{
 *   onBack: () => void,
 *   onOpenGallery: () => void,
 *   onOpenSettings: () => void
 * }} props
 */
const ChatHeader = ({ onBack, onOpenGallery, onOpenSettings }) => {
  const { user: currentUser } = useAuthStore();
  const { onlineUserIds } = useSocketStore();
  const { getActiveConversation } = useChatStore();

  const conversation = getActiveConversation();
  if (!conversation) {
    return null;
  }

  const isGroup = conversation.isGroup || conversation.type === 'group';
  const partner = isGroup
    ? null
    : conversation.participants.find((p) => p._id !== currentUser?._id);

  const displayName = isGroup ? conversation.name : partner?.displayName || partner?.username || 'User';
  const avatarUrl = isGroup ? conversation.groupAvatar?.url : partner?.avatar?.url;
  const isOnline = isGroup ? false : onlineUserIds.includes(partner?._id);

  // Presence Subtitle string
  const subtitle = isGroup
    ? `${conversation.participants.length} members`
    : isOnline
    ? 'Online'
    : formatLastSeen(partner?.lastSeen);

  return (
    <div className="h-16 border-b border-surface-800 bg-surface-900/60 backdrop-blur-md px-4 flex items-center justify-between shrink-0 select-none">
      {/* Profile info left block */}
      <div className="flex items-center gap-3 min-w-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="p-1 rounded-lg md:hidden shrink-0"
          title="Back to List"
        >
          <ArrowLeft className="w-5 h-5 text-surface-400" />
        </Button>

        <Avatar
          src={avatarUrl}
          username={displayName}
          status={isOnline ? 'online' : null}
          size="sm"
        />

        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold text-surface-50 truncate leading-tight flex items-center gap-1.5">
            <span>{displayName}</span>
            {partner?.privacy === 'private' && (
              <ShieldAlert className="w-3.5 h-3.5 text-warning-550 shrink-0" title="Private profile" />
            )}
          </span>
          <span
            className={`text-2xs truncate mt-0.5 font-medium ${
              isOnline ? 'text-success-500 font-semibold' : 'text-surface-500'
            }`}
          >
            {subtitle}
          </span>
        </div>
      </div>

      {/* Action shortcuts right block (Call place holders vs Group Settings gears) */}
      <div className="flex items-center gap-1 shrink-0">
        {isGroup ? (
          <Button
            variant="ghost"
            size="sm"
            className="p-2 rounded-lg"
            onClick={onOpenSettings}
            title="Group Settings"
          >
            <SettingsIcon className="w-4.5 h-4.5 text-surface-400" />
          </Button>
        ) : (
          <>
            <Button variant="ghost" size="sm" className="p-2 rounded-lg" disabled title="Voice Call">
              <Phone className="w-4.5 h-4.5 text-surface-500" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2 rounded-lg" disabled title="Video Call">
              <Video className="w-4.5 h-4.5 text-surface-500" />
            </Button>
          </>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="p-2 rounded-lg"
          onClick={onOpenGallery}
          title="Shared Files & Media"
        >
          <FolderClosed className="w-4.5 h-4.5 text-surface-400" />
        </Button>
        <Button variant="ghost" size="sm" className="p-2 rounded-lg" disabled title="Options">
          <MoreVertical className="w-4.5 h-4.5 text-surface-500" />
        </Button>
      </div>
    </div>
  );
};

const SettingsIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export default memo(ChatHeader);
export { ChatHeader };
