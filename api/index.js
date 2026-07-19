/**
 * Vercel Serverless Function entry point.
 *
 * Vercel does NOT run long-lived servers — it invokes this file per request.
 * We export the Express app directly (no httpServer.listen()) so Vercel can
 * pass req/res into it.
 *
 * DB connections are cached across warm invocations so we don't reconnect
 * on every request (Vercel reuses the same container for ~minutes after a
 * cold start, then destroys it).
 *
 * ⚠️  Socket.io real-time features are NOT available on Vercel serverless.
 *     Deploy the backend to Railway/Render for full real-time support.
 */

import '../backend/src/config/env.js'; // Validate required env vars
import { connectDB } from '../backend/src/config/db.js';
import createApp from '../backend/src/app.js';
import mongoose from 'mongoose';

// Cache the app across warm invocations inside the same container
let appInstance = null;

const getApp = async () => {
  // Only reconnect if not already connected (0 = disconnected, 1 = connected)
  if (mongoose.connection.readyState === 0) {
    await connectDB();
  }
  if (!appInstance) {
    // Pass null for io — Socket.io doesn't work on serverless
    appInstance = createApp(null);
  }
  return appInstance;
};

export default async function handler(req, res) {
  try {
    const app = await getApp();
    return app(req, res);
  } catch (error) {
    console.error('[Vercel Handler] Fatal error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server initialization failed. Please try again.',
    });
  }
}
