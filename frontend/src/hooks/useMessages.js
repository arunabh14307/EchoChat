import { useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { useChatStore } from '@store/chatStore';
import { useAuthStore } from '@store/authStore';
import chatService from '@services/chatService';
import { MESSAGES_PER_PAGE } from '@utils/constants';

/**
 * useMessages — fetches messages for a conversation, handles pagination, and triggers read receipts.
 *
 * @param {string | null} conversationId
 */
export const useMessages = (conversationId) => {
  const {
    getMessages,
    hasMoreMessages,
    isLoadingMessages,
    setMessages,
    prependMessages,
    setLoadingMessages,
    updateConversation,
  } = useChatStore();

  const { user: currentUser } = useAuthStore();

  const pageRef = useRef(1);
  const messages = getMessages(conversationId);
  const hasMore = hasMoreMessages[conversationId] ?? true;

  // ── Initial fetch ──────────────────────────────────────────
  useEffect(() => {
    if (!conversationId) {
      return;
    }

    pageRef.current = 1;

    const fetchInitial = async () => {
      setLoadingMessages(true);
      try {
        const { data } = await chatService.getMessages(conversationId, {
          page: 1,
          limit: MESSAGES_PER_PAGE,
        });
        setMessages(conversationId, data.messages, data.hasMore);

        // Mark messages as read on the backend
        await chatService.markAsRead(conversationId);

        // Update local unread count to 0 in store
        updateConversation(conversationId, {
          unreadCounts: [
            { user: currentUser?._id, count: 0 },
            // Keep others as is, but we don't have full participants counts.
            // A simple array map handles this cleanly:
          ],
        });
      } catch (error) {
        const msg = error.response?.data?.message || 'Failed to load messages';
        toast.error(msg);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchInitial();
  }, [conversationId, currentUser?._id]);

  // ── Load older messages (infinite scroll up) ───────────────
  const loadMoreMessages = useCallback(async () => {
    if (!conversationId || isLoadingMessages || !hasMore) {
      return;
    }

    pageRef.current += 1;
    setLoadingMessages(true);

    try {
      const { data } = await chatService.getMessages(conversationId, {
        page: pageRef.current,
        limit: MESSAGES_PER_PAGE,
      });
      prependMessages(conversationId, data.messages, data.hasMore);
    } catch (error) {
      pageRef.current -= 1; // revert page increment on failure
      const msg = error.response?.data?.message || 'Failed to load more messages';
      toast.error(msg);
    } finally {
      setLoadingMessages(false);
    }
  }, [conversationId, isLoadingMessages, hasMore, prependMessages, setLoadingMessages]);

  return {
    messages,
    isLoading: isLoadingMessages,
    hasMore,
    loadMoreMessages,
  };
};
