import api from './api';

/**
 * Auth Service — wraps all authentication API calls.
 */
const authService = {
  /**
   * Register a new user.
   * @param {{ username: string, email: string, password: string }} data
   */
  register: async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  /**
   * Login with email + password. Sets httpOnly refresh cookie server-side.
   * @param {{ email: string, password: string }} credentials
   */
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Silently refresh the access token using the httpOnly cookie.
   * Called automatically by the Axios interceptor.
   */
  refreshToken: async () => {
    const response = await api.post('/auth/refresh');
    return response.data;
  },

  /**
   * Logout — clears the httpOnly refresh cookie on the server.
   */
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  /**
   * Validate the current session and return the user profile.
   * Used on app boot to hydrate auth state.
   */
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export default authService;
