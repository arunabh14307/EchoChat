import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * Chat Store — manages conversations and messages.
 *
 * Messages are stored as a Map keyed by conversationId for O(1) access.
 * Conversations are sorted by lastMessage timestamp (most recent first).
 */
export const useChatStore = create(
  devtools(
    (set, get) => ({
      // ── State ────────────────────────────────────────────
      conversations: [],           // Array<Conversation>
      activeConversationId: null,  // string | null
      messages: {},                // Record<conversationId, Message[]>
      hasMoreMessages: {},         // Record<conversationId, boolean>
      isLoadingConversations: false,
      isLoadingMessages: false,

      // ── Conversation actions ──────────────────────────────
      setConversations: (conversations) =>
        set({ conversations }, false, 'setConversations'),

      addConversation: (conversation) =>
        set(
          (state) => ({
            conversations: [
              conversation,
              ...state.conversations.filter((c) => c._id !== conversation._id),
            ],
          }),
          false,
          'addConversation'
        ),

      updateConversation: (conversationId, updates) =>
        set(
          (state) => ({
            conversations: state.conversations.map((c) =>
              c._id === conversationId ? { ...c, ...updates } : c
            ),
          }),
          false,
          'updateConversation'
        ),

      removeConversation: (conversationId) =>
        set(
          (state) => ({
            conversations: state.conversations.filter((c) => c._id !== conversationId),
            activeConversationId:
              state.activeConversationId === conversationId ? null : state.activeConversationId,
          }),
          false,
          'removeConversation'
        ),

      setActiveConversation: (conversationId) =>
        set({ activeConversationId: conversationId }, false, 'setActiveConversation'),

      setLoadingConversations: (isLoadingConversations) =>
        set({ isLoadingConversations }, false, 'setLoadingConversations'),

      // ── Message actions ───────────────────────────────────
      setMessages: (conversationId, messages, hasMore = false) =>
        set(
          (state) => ({
            messages: { ...state.messages, [conversationId]: messages },
            hasMoreMessages: { ...state.hasMoreMessages, [conversationId]: hasMore },
          }),
          false,
          'setMessages'
        ),

      prependMessages: (conversationId, olderMessages, hasMore) =>
        set(
          (state) => ({
            messages: {
              ...state.messages,
              [conversationId]: [
                ...olderMessages,
                ...(state.messages[conversationId] || []),
              ],
            },
            hasMoreMessages: { ...state.hasMoreMessages, [conversationId]: hasMore },
          }),
          false,
          'prependMessages'
        ),

      addMessage: (conversationId, message) =>
        set(
          (state) => {
            const current = state.messages[conversationId] || [];
            const exists = current.some((m) => m._id === message._id);
            if (exists) {
              return {};
            }
            return {
              messages: {
                ...state.messages,
                [conversationId]: [...current, message],
              },
            };
          },
          false,
          'addMessage'
        ),

      updateMessage: (conversationId, messageId, updates) =>
        set(
          (state) => ({
            messages: {
              ...state.messages,
              [conversationId]: (state.messages[conversationId] || []).map((m) =>
                m._id === messageId ? { ...m, ...updates } : m
              ),
            },
          }),
          false,
          'updateMessage'
        ),

      setLoadingMessages: (isLoadingMessages) =>
        set({ isLoadingMessages }, false, 'setLoadingMessages'),

      // ── Selectors ────────────────────────────────────────
      getActiveConversation: () => {
        const { conversations, activeConversationId } = get();
        return conversations.find((c) => c._id === activeConversationId) || null;
      },

      getMessages: (conversationId) => get().messages[conversationId] || [],
    }),
    { name: 'ChatStore' }
  )
);
