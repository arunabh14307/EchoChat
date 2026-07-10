import React, { memo } from 'react';
import { Pin, MessageSquare, Loader2 } from 'lucide-react';
import { useChatStore } from '@store/chatStore';
import { useAuthStore } from '@store/authStore';
import ChatListItem from './ChatListItem';

/**
 * ChatList — displays pinned and regular conversation lists with skeleton fallbacks.
 *
 * @param {{
 *   onSelectChat: (conversationId: string) => void
 * }} props
 */
const ChatList = ({ onSelectChat }) => {
  const { conversations, activeConversationId, isLoadingConversations } = useChatStore();
  const { user: currentUser } = useAuthStore();

  const handleSelect = (id) => {
    onSelectChat(id);
  };

  // Group conversations into pinned and unpinned categories
  const pinnedChats = [];
  const regularChats = [];

  conversations.forEach((c) => {
    const isPinned = c.pinnedBy?.includes(currentUser?._id);
    if (isPinned) {
      pinnedChats.push(c);
    } else {
      regularChats.push(c);
    }
  });

  if (isLoadingConversations && conversations.length === 0) {
    // Skeletons list
    return (
      <div className="flex flex-col gap-2 p-3 animate-fade-in">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3.5 bg-surface-900/40 border border-transparent rounded-xl">
            <div className="w-10 h-10 rounded-full bg-surface-800 animate-pulse shrink-0" />
            <div className="flex-1 flex flex-col gap-1.5 min-w-0">
              <div className="flex justify-between items-center">
                <div className="h-4 w-28 bg-surface-800 rounded animate-pulse" />
                <div className="h-3 w-8 bg-surface-850 rounded animate-pulse" />
              </div>
              <div className="h-3.5 w-[70%] bg-surface-850 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none text-surface-500 gap-2">
        <MessageSquare className="w-8 h-8 opacity-45" />
        <p className="text-sm">No chats found</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-3 py-1 flex flex-col gap-4 scroll-hidden select-none animate-fade-in">
      {/* Pinned conversations segment */}
      {pinnedChats.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 px-2 text-2xs font-bold text-surface-500 uppercase tracking-wider select-none">
            <Pin className="w-3 h-3 text-primary-400 rotate-45" />
            <span>Pinned Chats</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {pinnedChats.map((c) => (
              <ChatListItem
                key={c._id}
                conversation={c}
                isActive={c._id === activeConversationId}
                onSelect={() => handleSelect(c._id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Regular chats segment */}
      <div className="flex flex-col gap-1.5">
        {pinnedChats.length > 0 && regularChats.length > 0 && (
          <div className="px-2 text-2xs font-bold text-surface-500 uppercase tracking-wider select-none mb-1.5">
            <span>All Messages</span>
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          {regularChats.map((c) => (
            <ChatListItem
              key={c._id}
              conversation={c}
              isActive={c._id === activeConversationId}
              onSelect={() => handleSelect(c._id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default memo(ChatList);
export { ChatList };
