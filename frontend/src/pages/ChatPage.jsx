import React from 'react';
import Sidebar from '@components/layout/Sidebar';
import ChatWindow from '@components/chat/ChatWindow';
import { useChatStore as useStore } from '@store/chatStore';
import { useSocket } from '@hooks/useSocket';

/**
 * ChatPage — layout orchestrator routing mobile panels and desktop side-by-side chats,
 * and initializes the Socket connection for real-time messaging.
 */
const ChatPage = () => {
  const { activeConversationId } = useStore();

  // Mount Socket.io connection lifecycle
  useSocket();

  return (
    <div className="h-screen w-screen bg-surface-950 flex overflow-hidden">
      {/* Sidebar navigation */}
      <div className={`h-full shrink-0 w-full md:w-80 ${activeConversationId ? 'hidden md:block' : 'block'}`}>
        <Sidebar />
      </div>

      {/* Main chat window / Empty state viewport */}
      <div className={`flex-1 h-full ${activeConversationId ? 'block' : 'hidden md:block'}`}>
        <ChatWindow />
      </div>
    </div>
  );
};

export default ChatPage;
export { ChatPage };
