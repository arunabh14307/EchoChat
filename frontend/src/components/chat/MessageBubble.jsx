import React, { memo } from 'react';
import { Edit2, Reply, Trash2, ShieldAlert, Check, CheckCheck, FileText, Download, ExternalLink } from 'lucide-react';
import { useAuthStore } from '@store/authStore';
import { formatMessageTime } from '@utils/formatTime';
import Avatar from '../ui/Avatar';
import Dropdown from '../ui/Dropdown';

/**
 * MessageBubble — renders a single message bubble (sent or received) with ticks, reply previews,
 * and support for media messages (images, videos, documents) and downloads.
 *
 * @param {{
 *   message: import('@types/message.types').Message,
 *   onReply: (message: any) => void,
 *   onEdit: (message: any) => void,
 *   onDeleteForMe: (messageId: string) => void,
 *   onDeleteForEveryone: (messageId: string) => void
 * }} props
 */
const MessageBubble = ({
  message,
  onReply,
  onEdit,
  onDeleteForMe,
  onDeleteForEveryone,
}) => {
  const { user: currentUser } = useAuthStore();

  const isMe = message.sender?._id === currentUser?._id;
  const isDeleted = message.deletedForEveryone;

  // Formatting message time
  const timeStr = formatMessageTime(message.createdAt);

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Status Ticks calculation (Only shown for messages sent by current user)
  const renderTicks = () => {
    if (!isMe || isDeleted) {
      return null;
    }

    const partnerSeen = message.seenBy?.some((s) => s.user !== currentUser?._id);
    const partnerDelivered = message.deliveredTo?.some((d) => d.user !== currentUser?._id);

    if (partnerSeen) {
      return <CheckCheck className="w-3.5 h-3.5 text-primary-400 shrink-0" />; // Blue ticks
    }
    if (partnerDelivered) {
      return <CheckCheck className="w-3.5 h-3.5 text-surface-500 shrink-0" />; // Grey ticks
    }
    return <Check className="w-3.5 h-3.5 text-surface-500 shrink-0" />; // Single tick
  };

  // Hover Action Items list
  const actionItems = [];

  if (!isDeleted) {
    actionItems.push({
      label: 'Reply',
      icon: <Reply className="w-3.5 h-3.5" />,
      onClick: () => onReply(message),
    });

    if (isMe && message.messageType === 'text') {
      // Only text messages can be edited
      actionItems.push({
        label: 'Edit',
        icon: <Edit2 className="w-3.5 h-3.5" />,
        onClick: () => onEdit(message),
      });
    }

    if (isMe) {
      actionItems.push({
        label: 'Delete for everyone',
        icon: <Trash2 className="w-3.5 h-3.5" />,
        onClick: () => onDeleteForEveryone(message._id),
        variant: 'danger',
      });
    }
  }

  // Always allow delete for me
  actionItems.push({
    label: 'Delete for me',
    icon: <Trash2 className="w-3.5 h-3.5" />,
    onClick: () => onDeleteForMe(message._id),
    variant: 'danger',
  });

  return (
    <div
      className={`
        group flex items-end gap-2.5 max-w-[85%] mb-1 select-text
        ${isMe ? 'self-end flex-row-reverse' : 'self-start'}
      `}
    >
      {/* Sender avatar display for incoming messages */}
      {!isMe && (
        <Avatar
          src={message.sender?.avatar?.url}
          username={message.sender?.displayName || message.sender?.username}
          size="xs"
          className="mb-0.5"
        />
      )}

      {/* Message Content Bubble wrapper */}
      <div className="flex flex-col gap-1 min-w-0">
        {/* Reply Context card block */}
        {message.replyTo && !isDeleted && (
          <div
            className={`
              text-xs border-l-2 p-2 rounded-t-lg bg-surface-900/60 flex flex-col gap-0.5 truncate select-none
              ${isMe ? 'border-primary-500/80 self-end' : 'border-surface-600'}
            `}
          >
            <span className="font-semibold text-2xs text-primary-400">
              {message.replyTo.sender?._id === currentUser?._id
                ? 'You'
                : message.replyTo.sender?.displayName || message.replyTo.sender?.username}
            </span>
            <span className="text-surface-400 truncate max-w-56 leading-none">
              {message.replyTo.deletedForEveryone
                ? 'This message was deleted'
                : message.replyTo.media
                ? `📎 ${message.replyTo.media.name}`
                : message.replyTo.content}
            </span>
          </div>
        )}

        {/* Bubble panel */}
        <div
          className={`
            relative p-3 flex flex-col shadow-sm max-w-fit
            ${
              isDeleted
                ? 'bg-surface-900 border border-surface-850 text-surface-500 italic rounded-2xl flex-row items-center gap-1.5 p-3.5'
                : isMe
                ? 'bubble-sent'
                : 'bubble-received'
            }
            ${message.replyTo && !isDeleted ? 'rounded-t-none' : ''}
          `}
        >
          {isDeleted ? (
            <>
              <ShieldAlert className="w-4 h-4 text-surface-600 shrink-0" />
              <span className="text-sm">This message was deleted</span>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              {/* Media rendering block */}
              {message.media && message.media.url && (
                <div className="rounded-lg overflow-hidden select-none shrink-0 mb-1 max-w-[280px]">
                  {message.messageType === 'image' ? (
                    <a href={message.media.url} target="_blank" rel="noreferrer" className="relative block group/img">
                      <img
                        src={message.media.url}
                        alt="attachment"
                        className="w-full max-h-56 object-cover rounded-lg border border-surface-700/40 hover:brightness-95 transition-all"
                      />
                      <div className="absolute top-2 right-2 bg-surface-950/70 p-1.5 rounded-lg opacity-0 group-hover/img:opacity-100 transition-opacity">
                        <ExternalLink className="w-3.5 h-3.5 text-white" />
                      </div>
                    </a>
                  ) : message.messageType === 'video' ? (
                    <video
                      src={message.media.url}
                      controls
                      className="w-full max-h-56 rounded-lg bg-black border border-surface-700/40"
                    />
                  ) : (
                    // Document File Card
                    <div className="flex items-center gap-3 p-3 bg-surface-900/60 border border-surface-800 rounded-xl w-60">
                      <div className="w-9 h-9 rounded-lg bg-surface-800 flex items-center justify-center text-primary-500 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-xs font-semibold text-surface-100 truncate leading-tight">
                          {message.media.name}
                        </span>
                        <span className="text-[10px] text-surface-500 mt-0.5 font-medium">
                          {formatBytes(message.media.size)}
                        </span>
                      </div>
                      <a
                        href={message.media.url}
                        download={message.media.name}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 bg-surface-800 hover:bg-surface-700 text-surface-300 hover:text-white rounded-lg transition-colors shrink-0"
                      >
                        <Download className="w-4.5 h-4.5" />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Message content/caption block */}
              {message.content && (
                <p className="text-sm leading-relaxed break-words whitespace-pre-wrap select-text px-0.5">
                  {message.content}
                </p>
              )}

              {/* Timestamp & metadata info details */}
              <div className="flex items-center justify-end gap-1.5 self-end select-none mt-0.5">
                {message.edited && (
                  <span className="text-[9px] text-surface-400/85 font-medium shrink-0">
                    edited
                  </span>
                )}
                <span className="text-[9px] text-surface-400/75 shrink-0">
                  {timeStr}
                </span>
                {renderTicks()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions Trigger Dropdown */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity self-center select-none shrink-0">
        <Dropdown
          trigger={
            <button className="p-1.5 rounded-lg hover:bg-surface-800 text-surface-500 hover:text-surface-300 transition-colors">
              <MoreVerticalIcon className="w-4 h-4" />
            </button>
          }
          items={actionItems}
          position={isMe ? 'top-left' : 'top-right'}
        />
      </div>
    </div>
  );
};

// Local custom MoreVertical icon
const MoreVerticalIcon = ({ className }) => (
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
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
);

export default memo(MessageBubble);
export { MessageBubble };
