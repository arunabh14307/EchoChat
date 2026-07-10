import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useChatStore } from '@store/chatStore';
import { useAuthStore } from '@store/authStore';
import { useSocketStore } from '@store/socketStore';
import { useMessages } from '@hooks/useMessages';
import chatService from '@services/chatService';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import MediaGalleryModal from './MediaGalleryModal';
import GroupSettingsModal from './GroupSettingsModal';
import { MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * ChatWindow — manages active chat timeline, scroll positions, file uploads, and media galleries.
 */
const ChatWindow = () => {
  const {
    activeConversationId,
    getActiveConversation,
    setActiveConversation,
    addMessage,
    updateMessage,
    updateConversation,
  } = useChatStore();

  const { user: currentUser } = useAuthStore();
  const { typingUsers } = useSocketStore();

  const conversation = getActiveConversation();

  // Load message logs & page actions
  const { messages, isLoading, hasMore, loadMoreMessages } = useMessages(activeConversationId);

  // States
  const [replyMessage, setReplyMessage] = useState(null);
  const [editMessage, setEditMessage] = useState(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const listRef = useRef(null);
  const messagesEndRef = useRef(null);
  const prevScrollHeightRef = useRef(0);

  const isGroup = conversation?.type === 'group';
  const partner = isGroup
    ? null
    : conversation?.participants.find((p) => p._id !== currentUser?._id);

  // Checks if the chat partner is typing in active room
  const isPartnerTyping = useMemo(() => {
    if (!conversation || isGroup) {
      return false;
    }
    return typingUsers[conversation._id]?.includes(partner?._id);
  }, [typingUsers, conversation, partner?._id, isGroup]);

  // Maintain scroll position when prepending paginated logs
  useEffect(() => {
    const list = listRef.current;
    if (!list) {
      return;
    }

    if (prevScrollHeightRef.current > 0) {
      const scrollDiff = list.scrollHeight - prevScrollHeightRef.current;
      list.scrollTop = scrollDiff;
      prevScrollHeightRef.current = 0;
    }
  }, [messages.length]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, isPartnerTyping]);

  const handleScroll = async (e) => {
    const list = e.currentTarget;
    if (list.scrollTop === 0 && hasMore && !isLoading) {
      prevScrollHeightRef.current = list.scrollHeight;
      await loadMoreMessages();
    }
  };

  // Compose actions
  const handleSend = async (text) => {
    try {
      const response = await chatService.sendMessage({
        conversationId: activeConversationId,
        content: text,
        replyTo: replyMessage?._id || undefined,
      });

      const message = response.data.message;
      addMessage(activeConversationId, message);

      // Bubble up last message updates
      updateConversation(activeConversationId, {
        lastMessage: message,
        lastMessageAt: message.createdAt,
        updatedAt: message.createdAt,
      });

      setReplyMessage(null);
    } catch {
      toast.error('Failed to send message');
    }
  };

  // Upload attachment file logic
  const handleSendMedia = async (file, caption, onProgress) => {
    try {
      const response = await chatService.sendMediaMessage({
        conversationId: activeConversationId,
        file,
        content: caption || undefined,
        replyTo: replyMessage?._id || undefined,
        onProgress,
      });

      const message = response.data.message;
      addMessage(activeConversationId, message);

      // Bubble up last message updates
      updateConversation(activeConversationId, {
        lastMessage: message,
        lastMessageAt: message.createdAt,
        updatedAt: message.createdAt,
      });

      setReplyMessage(null);
    } catch (err) {
      throw err; // bubble up error to let input component know to show "Retry"
    }
  };

  const handleEditSubmit = async (messageId, text) => {
    try {
      const response = await chatService.editMessage(messageId, { content: text });
      const updated = response.data.message;
      updateMessage(activeConversationId, messageId, updated);
      setEditMessage(null);
      toast.success('Message edited');
    } catch {
      toast.error('Failed to edit message');
    }
  };

  const handleDeleteForMe = async (messageId) => {
    try {
      await chatService.deleteMessageForMe(messageId);
      updateMessage(activeConversationId, messageId, { deletedForMe: [currentUser?._id] });
      toast.success('Message deleted for you');
    } catch {
      toast.error('Failed to delete message');
    }
  };

  const handleDeleteForEveryone = async (messageId) => {
    try {
      const response = await chatService.deleteMessageForEveryone(messageId);
      const updated = response.data.message;
      updateMessage(activeConversationId, messageId, updated);
      toast.success('Message deleted for everyone');
    } catch {
      toast.error('Failed to delete message');
    }
  };

  if (!activeConversationId || !conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none bg-surface-950/40 relative h-full">
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-primary-600/5 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[20%] left-[10%] w-[30%] h-[30%] rounded-full bg-purple-600/5 blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-4 max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-surface-900 border border-surface-800 flex items-center justify-center shadow-glow-sm text-primary-500">
            <MessageSquare className="w-8 h-8" />
          </div>
          <div className="flex flex-col gap-1.5">
            <h2 className="text-xl font-bold text-surface-50 font-sans">Welcome to EchoChat</h2>
            <p className="text-sm text-surface-400 leading-relaxed font-sans">
              Select an active conversation from the sidebar or search for users to start messaging.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-surface-950/20 relative select-none">
      {/* Header bar */}
      <ChatHeader
        onBack={() => setActiveConversation(null)}
        onOpenGallery={() => setIsGalleryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Messages Timeline area */}
      <div
        ref={listRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-3.5 flex flex-col gap-2 scroll-hidden select-text"
      >
        {isLoading && hasMore && (
          <div className="flex-center py-4 text-surface-500">
            <LoaderIcon className="w-5 h-5 animate-spin text-primary-500" />
          </div>
        )}

        {messages.length > 0 ? (
          <div className="flex flex-col gap-1.5 min-h-0">
            {messages.map((m) => {
              if (m.deletedForMe?.includes(currentUser?._id)) {
                return null;
              }
              return (
                <MessageBubble
                  key={m._id}
                  message={m}
                  onReply={setReplyMessage}
                  onEdit={setEditMessage}
                  onDeleteForMe={handleDeleteForMe}
                  onDeleteForEveryone={handleDeleteForEveryone}
                />
              );
            })}
          </div>
        ) : (
          <div className="m-auto flex flex-col items-center gap-2 select-none text-surface-500 text-center py-12 max-w-xs">
            <MessageSquare className="w-8 h-8 opacity-45" />
            <p className="text-sm font-sans">No messages yet. Say hello!</p>
          </div>
        )}

        {/* Typing indicators */}
        {isPartnerTyping && (
          <div className="self-start mt-1">
            <TypingIndicator />
          </div>
        )}

        {/* Anchor point to scroll to */}
        <div ref={messagesEndRef} className="h-1 shrink-0" />
      </div>

      {/* Message Composer controls */}
      <MessageInput
        conversationId={activeConversationId}
        replyToMessage={replyMessage}
        onClearReply={() => setReplyMessage(null)}
        editMessage={editMessage}
        onClearEdit={() => setEditMessage(null)}
        onSend={handleSend}
        onSendMedia={handleSendMedia}
        onEditSubmit={handleEditSubmit}
      />

      {/* Media Gallery Tab Drawer */}
      <MediaGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
      />

      {/* Group Settings Panel Drawer */}
      <GroupSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

const LoaderIcon = ({ className }) => (
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
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export default ChatWindow;
export { ChatWindow };
