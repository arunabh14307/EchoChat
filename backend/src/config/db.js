import mongoose from 'mongoose';
import { env } from './env.js';

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
    process.exit(1);
  }
};
