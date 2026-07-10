import { Server } from 'socket.io';
import { env } from '../config/env.js';
import { socketAuth } from './middleware/socketAuth.js';
import { presenceHandler } from './handlers/presenceHandler.js';
import { roomHandler } from './handlers/roomHandler.js';
import { messageHandler } from './handlers/messageHandler.js';
import { logger } from '../utils/logger.js';

// Shared in-memory Map: userId → Set<socketId>
const onlineUsers = new Map();

/**
 * initSocket — attaches Socket.io to the HTTP server.
 *
 * @param {import('http').Server} httpServer
 * @returns {import('socket.io').Server} io instance
 */
export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: env.clientUrl,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // ── Auth middleware ────────────────────────────────────────
  io.use(socketAuth);

  // ── Connection handler ────────────────────────────────────
  io.on('connection', (socket) => {
    logger.info(`[Socket] User ${socket.userId} connected (${socket.id})`);
    
    // Join personal user-specific room for targeted events (like notifications)
    socket.join(socket.userId);

    // Register handlers
    presenceHandler(io, socket, onlineUsers);
    roomHandler(io, socket);
    messageHandler(io, socket);

    socket.on('disconnect', () => {
      logger.info(`[Socket] User ${socket.userId} disconnected (${socket.id})`);
    });
  });

  return io;
};

/**
 * Get the shared onlineUsers Map.
 * Used by REST controllers to emit targeted socket events.
 */
export const getOnlineUsers = () => onlineUsers;
