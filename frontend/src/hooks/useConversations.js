import { useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useChatStore } from '@store/chatStore';
import chatService from '@services/chatService';

/**
 * useConversations — fetches and manages the conversations list.
 *
 * Handles loading state, error toasts, and exposes a refresh function
 * so components can trigger a manual refetch after creating a new chat.
 */
export const useConversations = () => {
  const {
    conversations,
    isLoadingConversations,
    setConversations,
    setLoadingConversations,
  } = useChatStore();

  const fetchConversations = useCallback(async () => {
    setLoadingConversations(true);
    try {
      const { data } = await chatService.getConversations();
      setConversations(data.conversations);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to load conversations';
      toast.error(message);
    } finally {
      setLoadingConversations(false);
    }
  }, [setConversations, setLoadingConversations]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    isLoading: isLoadingConversations,
    refetch: fetchConversations,
  };
};
