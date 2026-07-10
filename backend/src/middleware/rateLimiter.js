import rateLimit from 'express-rate-limit';
import ApiError from '../utils/ApiError.js';

/**
 * General API rate limiter.
 * 100 requests per 15 minutes per IP.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(ApiError.tooManyRequests('Too many requests, please try again later'));
  },
});

/**
 * Strict rate limiter for auth routes.
 * 10 attempts per 15 minutes per IP — prevents brute force.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(ApiError.tooManyRequests('Too many login attempts, please try again later'));
  },
});

/**
 * Message sending rate limiter.
 * 60 messages per minute — prevents spam.
 */
export const messageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(ApiError.tooManyRequests('Sending too fast, slow down'));
  },
});
