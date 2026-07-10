import cloudinary from 'cloudinary';
import { env } from './env.js';

/**
 * Configure Cloudinary SDK.
 * Called once at server startup.
 */
cloudinary.v2.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
  secure: true,
});

export default cloudinary.v2;
