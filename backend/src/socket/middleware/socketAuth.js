import ApiError from '../../utils/ApiError.js';
import { verifyAccessToken } from '../../utils/generateTokens.js';

/**
 * socketAuth — Socket.io middleware that verifies the JWT on handshake.
 *
 * The client sends: socket = io(url, { auth: { token: accessToken } })
 * We attach socket.userId so handlers can identify the user.
 */
export const socketAuth = (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error('Authentication token missing'));
    }

    const decoded = verifyAccessToken(token);
    socket.userId = decoded.userId;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new Error('Authentication token expired'));
    }
    next(new Error('Authentication token invalid'));
  }
};
