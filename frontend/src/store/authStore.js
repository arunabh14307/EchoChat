import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

/**
 * Auth Store — manages authentication state.
 *
 * Access token is kept in memory only (never persisted).
 * User profile and isAuthenticated are persisted to localStorage
 * so the UI can optimistically render while the refresh-token
 * flow confirms the session on next load.
 */
export const useAuthStore = create(
  devtools(
    persist(
      (set, get) => ({
        // ── State ────────────────────────────────────────────
        user: null,           // Logged-in user object
        accessToken: null,    // Short-lived JWT (memory only)
        isAuthenticated: false,
        isLoading: false,

        // ── Actions ──────────────────────────────────────────
        setAuth: (user, accessToken) =>
          set({ user, accessToken, isAuthenticated: true }, false, 'setAuth'),

        setAccessToken: (accessToken) =>
          set({ accessToken }, false, 'setAccessToken'),

        updateUser: (updates) =>
          set(
            (state) => ({ user: { ...state.user, ...updates } }),
            false,
            'updateUser'
          ),

        setLoading: (isLoading) => set({ isLoading }, false, 'setLoading'),

        logout: () =>
          set(
            { user: null, accessToken: null, isAuthenticated: false },
            false,
            'logout'
          ),

        // ── Selectors ────────────────────────────────────────
        getUser: () => get().user,
        getAccessToken: () => get().accessToken,
      }),
      {
        name: 'echochat-auth',
        // Only persist user + isAuthenticated, NOT the access token
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: 'AuthStore' }
  )
);
