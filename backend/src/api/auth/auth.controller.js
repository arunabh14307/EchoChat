import * as authService from './auth.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import { refreshTokenCookieOptions } from '../../utils/generateTokens.js';

/**
 * Helper — set the httpOnly refresh token cookie.
 * @param {import('express').Response} res
 * @param {string} token
 */
const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, refreshTokenCookieOptions);
};

/**
 * Helper — clear the refresh token cookie.
 * @param {import('express').Response} res
 */
const clearRefreshCookie = (res) => {
  res.clearCookie('refreshToken', {
    ...refreshTokenCookieOptions,
    maxAge: 0,
  });
};

// ── POST /api/auth/register ────────────────────────────────────
export const register = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await authService.registerUser(
      req.body,
      { userAgent: req.headers['user-agent'], ip: req.ip }
    );

    setRefreshCookie(res, refreshToken);

    res.status(201).json(
      new ApiResponse(201, `Welcome to EchoChat, ${user.username}!`, {
        user,
        accessToken,
      })
    );
  } catch (error) {
    next(error);
  }
};

// ── POST /api/auth/login ───────────────────────────────────────
export const login = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await authService.loginUser(
      req.body,
      { userAgent: req.headers['user-agent'], ip: req.ip }
    );

    setRefreshCookie(res, refreshToken);

    res.status(200).json(
      new ApiResponse(200, `Welcome back, ${user.username}!`, {
        user,
        accessToken,
      })
    );
  } catch (error) {
    next(error);
  }
};

// ── POST /api/auth/refresh ─────────────────────────────────────
export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;

    const {
      user,
      accessToken,
      refreshToken: newRefreshToken,
    } = await authService.refreshUserToken(token);

    setRefreshCookie(res, newRefreshToken);

    res.status(200).json(
      new ApiResponse(200, 'Token refreshed successfully', {
        user,
        accessToken,
      })
    );
  } catch (error) {
    next(error);
  }
};

// ── POST /api/auth/logout ──────────────────────────────────────
// Requires authMiddleware — ensures only valid sessions can log out.
export const logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    const userId = req.user?.userId;

    await authService.logoutUser(token, userId);

    clearRefreshCookie(res);

    res.status(200).json(new ApiResponse(200, 'Logged out successfully'));
  } catch (error) {
    next(error);
  }
};

// ── GET /api/auth/me ───────────────────────────────────────────
// Requires authMiddleware — validates the session and returns user profile.
export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getAuthenticatedUser(req.user.userId);

    res.status(200).json(new ApiResponse(200, 'User profile fetched', { user }));
  } catch (error) {
    next(error);
  }
};
