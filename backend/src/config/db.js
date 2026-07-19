import mongoose from 'mongoose';
import dns from 'dns';
import { env } from './env.js';

// Use public DNS servers to prevent ISP/Jio DNS query timeouts on MongoDB SRV records
dns.setServers(['8.8.8.8', '1.1.1.1']);

/**
 * connectDB — establishes the Mongoose connection.
 * Called once in index.js before starting the HTTP server.
 *
 * Connection options:
 * - serverSelectionTimeoutMS: fail fast in dev if Mongo isn't running
 */
export const connectDB = async () => {
  try {
    const connection = await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.info(`[MongoDB] Connected: ${connection.connection.host}`);

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Disconnected from database');
    });

    mongoose.connection.on('error', (err) => {
      console.error('[MongoDB] Connection error:', err);
    });
  } catch (error) {
    console.error('[MongoDB] Failed to connect:', error.message);
    // Throw instead of process.exit so serverless handlers can catch and respond with 500
    throw error;
  }
};
