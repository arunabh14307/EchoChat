import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * UI Store — manages transient UI state: modals, panels, theme.
 */
export const useUiStore = create(
  devtools(
    (set) => ({
      // ── State ────────────────────────────────────────────
      isMobileSidebarOpen: false,
      isNewChatModalOpen: false,
      isNewGroupModalOpen: false,
      isProfileDrawerOpen: false,
      isUserInfoPanelOpen: false,
      activeModal: null,        // string | null — generic modal key

      // ── Actions ──────────────────────────────────────────
      toggleMobileSidebar: () =>
        set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen }), false, 'toggleMobileSidebar'),

      openNewChatModal: () =>
        set({ isNewChatModalOpen: true }, false, 'openNewChatModal'),

      closeNewChatModal: () =>
        set({ isNewChatModalOpen: false }, false, 'closeNewChatModal'),

      openNewGroupModal: () =>
        set({ isNewGroupModalOpen: true }, false, 'openNewGroupModal'),

      closeNewGroupModal: () =>
        set({ isNewGroupModalOpen: false }, false, 'closeNewGroupModal'),

      openProfileDrawer: () =>
        set({ isProfileDrawerOpen: true }, false, 'openProfileDrawer'),

      closeProfileDrawer: () =>
        set({ isProfileDrawerOpen: false }, false, 'closeProfileDrawer'),

      toggleUserInfoPanel: () =>
        set(
          (state) => ({ isUserInfoPanelOpen: !state.isUserInfoPanelOpen }),
          false,
          'toggleUserInfoPanel'
        ),

      setActiveModal: (modal) => set({ activeModal: modal }, false, 'setActiveModal'),
      closeModal: () => set({ activeModal: null }, false, 'closeModal'),
    }),
    { name: 'UiStore' }
  )
);
