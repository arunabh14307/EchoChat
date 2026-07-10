import ApiError from '../utils/ApiError.js';
import { verifyAccessToken } from '../utils/generateTokens.js';

/**
 * authMiddleware — verifies the JWT access token on protected routes.
 *
 * Expects: Authorization: Bearer <accessToken>
 * Attaches: req.user = { userId }
 */
export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Access token missing or malformed');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Access token expired'));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(ApiError.unauthorized('Access token invalid'));
    }
    next(error);
  }
};
