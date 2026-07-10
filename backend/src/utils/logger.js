import { env } from '../config/env.js';

/**
 * Minimal structured logger.
 * In production you'd swap this with Winston or Pino.
 */
const levels = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = env.isDev ? levels.debug : levels.info;

const timestamp = () => new Date().toISOString();

export const logger = {
  error: (...args) => {
    if (currentLevel >= levels.error) {
      console.error(`[${timestamp()}] [ERROR]`, ...args);
    }
  },
  warn: (...args) => {
    if (currentLevel >= levels.warn) {
      console.warn(`[${timestamp()}] [WARN]`, ...args);
    }
  },
  info: (...args) => {
    if (currentLevel >= levels.info) {
      console.info(`[${timestamp()}] [INFO]`, ...args);
    }
  },
  debug: (...args) => {
    if (currentLevel >= levels.debug) {
      console.info(`[${timestamp()}] [DEBUG]`, ...args);
    }
  },
};
