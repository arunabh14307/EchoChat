import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * Generate an access token (short-lived).
 * @param {string} userId
 * @returns {string} Signed JWT
 */
export const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn,
  });
};

/**
 * Generate a refresh token (long-lived).
 * @param {string} userId
 * @returns {string} Signed JWT
 */
export const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
  });
};

/**
 * Generate both tokens at once.
 * @param {string} userId
 * @returns {{ accessToken: string, refreshToken: string }}
 */
export const generateTokenPair = (userId) => {
  return {
    accessToken: generateAccessToken(userId),
    refreshToken: generateRefreshToken(userId),
  };
};

/**
 * Verify and decode an access token.
 * @param {string} token
 * @returns {{ userId: string }}
 * @throws {JsonWebTokenError | TokenExpiredError}
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, env.jwt.accessSecret);
};

/**
 * Verify and decode a refresh token.
 * @param {string} token
 * @returns {{ userId: string }}
 * @throws {JsonWebTokenError | TokenExpiredError}
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.jwt.refreshSecret);
};

/**
 * Cookie options for the httpOnly refresh token.
 * Samsite=strict prevents CSRF.
 */
export const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  path: '/',
};
