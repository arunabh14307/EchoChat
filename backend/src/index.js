import http from 'http';
import './config/env.js'; // Validate env vars first
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { initSocket } from './socket/index.js';
import createApp from './app.js';
import { logger } from './utils/logger.js';

/**
 * Bootstrap the EchoChat server:
 * 1. Connect to MongoDB
 * 2. Create Express app
 * 3. Create HTTP server
 * 4. Attach Socket.io
 * 5. Start listening
 */
const bootstrap = async () => {
  // ── 1. Database ────────────────────────────────────────────
  await connectDB();

  // ── 2 & 3. Express + HTTP server ──────────────────────────
  const httpServer = http.createServer(); // App added after socket init

  // ── 4. Socket.io ──────────────────────────────────────────
  const io = initSocket(httpServer);

  // ── 5. Express app (receives io for injection) ─────────────
  const app = createApp(io);
  httpServer.on('request', app);

  // ── 6. Start listening ─────────────────────────────────────
  httpServer.listen(env.port, () => {
    logger.info(`🚀 EchoChat server running on http://localhost:${env.port}`);
    logger.info(`🌍 Environment: ${env.nodeEnv}`);
    logger.info(`🔌 Socket.io ready`);
  });

  // ── Graceful shutdown ──────────────────────────────────────
  const shutdown = (signal) => {
    logger.info(`[Server] ${signal} received — shutting down gracefully`);
    httpServer.close(() => {
      logger.info('[Server] HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // ── Unhandled rejections ───────────────────────────────────
  process.on('unhandledRejection', (reason) => {
    logger.error('[Server] Unhandled rejection:', reason);
    process.exit(1);
  });
};

bootstrap();
