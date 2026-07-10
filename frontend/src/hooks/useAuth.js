import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '@store/authStore';
import { useSocketStore } from '@store/socketStore';
import authService from '@services/authService';

/**
 * useAuth — auth actions hook.
 * Provides login, register, logout and the current auth state.
 * All network calls are delegated to authService.
 */
export const useAuth = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, setAuth, setLoading, logout: clearAuth } = useAuthStore();
  const { socket, disconnectSocket } = useSocketStore();

  /**
   * Register a new account and automatically log in.
   * @param {{ username: string, email: string, password: string }} formData
   */
  const register = useCallback(
    async (formData) => {
      setLoading(true);
      try {
        const { data } = await authService.register(formData);
        setAuth(data.user, data.accessToken);
        toast.success(`Welcome to EchoChat, ${data.user.username}! 🎉`);
        navigate('/', { replace: true });
      } catch (error) {
        const message = error.response?.data?.message || 'Registration failed. Please try again.';
        toast.error(message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setAuth, setLoading, navigate]
  );

  /**
   * Log in with email + password.
   * @param {{ email: string, password: string }} credentials
   */
  const login = useCallback(
    async (credentials) => {
      setLoading(true);
      try {
        const { data } = await authService.login(credentials);
        setAuth(data.user, data.accessToken);
        toast.success(`Welcome back, ${data.user.username}!`);
        navigate('/', { replace: true });
      } catch (error) {
        const message = error.response?.data?.message || 'Login failed. Check your credentials.';
        toast.error(message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setAuth, setLoading, navigate]
  );

  /**
   * Log out — clears client state, disconnects socket, and calls server to clear cookie.
   */
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore server errors — still clear client state
    } finally {
      if (socket) {
        socket.disconnect();
        disconnectSocket();
      }
      clearAuth();
      navigate('/login', { replace: true });
    }
  }, [socket, disconnectSocket, clearAuth, navigate]);

  /**
   * Initialize auth — silently refresh access token on app load.
   */
  const initAuth = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await authService.refreshToken();
      setAuth(data.user, data.accessToken);
    } catch (error) {
      // Refresh failed or no session cookie, clean up stores
      clearAuth();
    } finally {
      setLoading(false);
    }
  }, [setAuth, setLoading, clearAuth]);

  return {
    user,
    isAuthenticated,
    isLoading,
    register,
    login,
    logout,
    initAuth,
  };
};

