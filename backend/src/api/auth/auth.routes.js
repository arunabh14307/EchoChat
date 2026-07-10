import { Router } from 'express';
import { register, login, logout, refreshToken, getMe } from './auth.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authLimiter } from '../../middleware/rateLimiter.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { registerSchema, loginSchema } from './auth.validator.js';

/**
 * Auth routes — mounted at /api/auth
 *
 * POST   /api/auth/register  — create account (rate-limited)
 * POST   /api/auth/login     — sign in (rate-limited)
 * POST   /api/auth/refresh   — rotate refresh token (cookie-based)
 * POST   /api/auth/logout    — revoke token + clear cookie (protected)
 * GET    /api/auth/me        — fetch current user profile (protected)
 */
const router = Router();

// Public routes (rate-limited)
router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login',    authLimiter, validate(loginSchema),    login);
router.post('/refresh',  refreshToken);

// Protected routes
router.post('/logout', authMiddleware, logout);
router.get('/me',      authMiddleware, getMe);

export default router;
