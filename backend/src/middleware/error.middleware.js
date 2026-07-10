import ApiError from '../utils/ApiError.js';
import { env } from '../config/env.js';

/**
 * Global error handling middleware.
 * Must be registered LAST in Express (after all routes).
 *
 * Formats all errors — including ApiError, Mongoose validation errors,
 * and unexpected runtime errors — into a consistent JSON shape.
 */
// eslint-disable-next-line no-unused-vars
export const errorMiddleware = (err, req, res, next) => {
  let error = err;

  // ── Wrap non-ApiError instances ───────────────────────────
  if (!(error instanceof ApiError)) {
    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || 'Internal server error';
    error = new ApiError(statusCode, message, err.errors || [], err.stack);
  }

  // ── Mongoose duplicate key (e.g. unique email) ────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    error = ApiError.conflict(`${field} already exists`);
  }

  // ── Mongoose validation error ─────────────────────────────
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = ApiError.badRequest('Validation failed', messages);
  }

  // ── Mongoose bad ObjectId ─────────────────────────────────
  if (err.name === 'CastError') {
    error = ApiError.badRequest(`Invalid ${err.path}: ${err.value}`);
  }

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    ...(error.errors?.length > 0 && { errors: error.errors }),
    ...(env.isDev && { stack: error.stack }),
  };

  res.status(error.statusCode).json(response);
};
