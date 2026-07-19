import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import ApiError from './utils/ApiError.js';

// ── Route imports ──────────────────────────────────────────────
import authRoutes from './api/auth/auth.routes.js';
import userRoutes from './api/users/user.routes.js';
import conversationRoutes from './api/conversations/conversation.routes.js';
import messageRoutes from './api/messages/message.routes.js';
import groupRoutes from './api/groups/group.routes.js';
import notificationRoutes from './api/notifications/notification.routes.js';

/**
 * createApp — Express application factory.
 * Separated from index.js so it's independently testable.
 *
 * @param {import('socket.io').Server} io - Socket.io instance (injected for controller use)
 * @returns {import('express').Application}
 */
const createApp = (io) => {
  const app = express();

  // ── Security headers ───────────────────────────────────────
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // ── CORS ───────────────────────────────────────────────────
  // Allowed origins: configured CLIENT_URL + localhost dev + any *.vercel.app
  const allowedOrigins = [
    env.clientUrl,                  // e.g. https://your-app.vercel.app (set in env)
    'http://localhost:5173',        // Vite dev server
    'http://localhost:3000',        // CRA fallback
  ].filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, curl)
        if (!origin) return callback(null, true);
        // Allow any *.vercel.app domain (covers preview deploys too)
        if (origin.endsWith('.vercel.app')) return callback(null, true);
        // Allow explicitly configured origins
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS: Origin '${origin}' not allowed`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // ── Request parsing ────────────────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // ── HTTP logger (dev only) ─────────────────────────────────
  if (env.isDev) {
    app.use(morgan('dev'));
  }

  // ── Inject socket.io for controller access ─────────────────
  if (io) {
    app.use((req, _res, next) => {
      req.io = io;
      next();
    });
  }

  // ── Global rate limiter ────────────────────────────────────
  app.use('/api', apiLimiter);

  // ── Health check ───────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      service: 'EchoChat API',
      timestamp: new Date().toISOString(),
    });
  });

  // ── API Routes ─────────────────────────────────────────────
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/conversations', conversationRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/groups', groupRoutes);
  app.use('/api/notifications', notificationRoutes);

  // ── 404 handler ────────────────────────────────────────────
  app.use((_req, _res, next) => {
    next(ApiError.notFound('Route not found'));
  });

  // ── Global error handler (must be last) ───────────────────
  app.use(errorMiddleware);

  return app;
};

export default createApp;
