import User from '../../models/User.model.js';
import RefreshToken from '../../models/RefreshToken.model.js';
import {
  generateTokenPair,
  verifyRefreshToken,
} from '../../utils/generateTokens.js';
import ApiError from '../../utils/ApiError.js';

/** Refresh token expiry in milliseconds (7 days) */
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// ── Register ───────────────────────────────────────────────────
/**
 * Create a new user account, generate token pair, and persist refresh token.
 *
 * @param {{ username: string, email: string, password: string }} data
 * @param {{ userAgent?: string, ip?: string }} meta
 * @returns {{ user: User, accessToken: string, refreshToken: string }}
 */
export const registerUser = async ({ username, email, password }, meta = {}) => {
  // Check for duplicate email or username
  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) {
    if (existing.email === email) {
      throw ApiError.conflict('An account with this email already exists');
    }
    throw ApiError.conflict('This username is already taken');
  }

  // Create user — passwordHash is auto-hashed by the pre-save hook
  const user = await User.create({
    username,
    email,
    passwordHash: password,
    status: 'online',
  });

  const { accessToken, refreshToken } = generateTokenPair(user._id.toString());

  await RefreshToken.create({
    userId: user._id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    userAgent: meta.userAgent || '',
    ipAddress: meta.ip || '',
  });

  return { user, accessToken, refreshToken };
};

// ── Login ──────────────────────────────────────────────────────
/**
 * Verify credentials, generate token pair, persist refresh token.
 *
 * @param {{ email: string, password: string }} credentials
 * @param {{ userAgent?: string, ip?: string }} meta
 * @returns {{ user: User, accessToken: string, refreshToken: string }}
 */
export const loginUser = async ({ email, password }, meta = {}) => {
  // Find user — select passwordHash explicitly (it's excluded by default)
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) {
    // Return generic message to prevent email enumeration
    throw ApiError.unauthorized('Invalid email or password');
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Update presence
  user.status = 'online';
  user.lastSeen = new Date();
  await user.save({ validateBeforeSave: false });

  const { accessToken, refreshToken } = generateTokenPair(user._id.toString());

  await RefreshToken.create({
    userId: user._id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    userAgent: meta.userAgent || '',
    ipAddress: meta.ip || '',
  });

  return { user, accessToken, refreshToken };
};

// ── Refresh ────────────────────────────────────────────────────
/**
 * Verify refresh token, rotate it, and issue a new token pair.
 * Implements refresh token rotation — each token can only be used once.
 *
 * @param {string | undefined} refreshToken
 * @returns {{ user: User, accessToken: string, refreshToken: string }}
 */
export const refreshUserToken = async (refreshToken) => {
  if (!refreshToken) {
    throw ApiError.unauthorized('Refresh token missing');
  }

  // 1. Verify JWT signature
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw ApiError.unauthorized('Refresh token is invalid or expired');
  }

  // 2. Check it exists in DB (guards against reuse after logout)
  const tokenDoc = await RefreshToken.findOne({ token: refreshToken });
  if (!tokenDoc) {
    // Potential token reuse — could log a security event here
    throw ApiError.unauthorized('Refresh token has been revoked');
  }

  // 3. Check user still exists
  const user = await User.findById(decoded.userId);
  if (!user) {
    await RefreshToken.deleteOne({ token: refreshToken });
    throw ApiError.unauthorized('User account not found');
  }

  // 4. Rotate — delete old token, create new pair
  await RefreshToken.deleteOne({ token: refreshToken });

  const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(
    user._id.toString()
  );

  await RefreshToken.create({
    userId: user._id,
    token: newRefreshToken,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    userAgent: tokenDoc.userAgent,
    ipAddress: tokenDoc.ipAddress,
  });

  return { user, accessToken, refreshToken: newRefreshToken };
};

// ── Logout ─────────────────────────────────────────────────────
/**
 * Revoke the refresh token and update user presence to offline.
 *
 * @param {string | undefined} refreshToken
 * @param {string} userId
 */
export const logoutUser = async (refreshToken, userId) => {
  if (refreshToken) {
    await RefreshToken.deleteOne({ token: refreshToken });
  }

  if (userId) {
    await User.findByIdAndUpdate(userId, {
      status: 'offline',
      lastSeen: new Date(),
    });
  }
};

// ── Get Authenticated User ─────────────────────────────────────
/**
 * Fetch the full user document for the currently authenticated user.
 *
 * @param {string} userId
 * @returns {User}
 */
export const getAuthenticatedUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return user;
};
