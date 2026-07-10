import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';
import ApiError from '../utils/ApiError.js';

// ── Cloudinary storage for avatars ────────────────────────────
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'echochat/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }],
  },
});

// ── Cloudinary storage for cover photos ───────────────────────
const coverStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'echochat/covers',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 800, height: 300, crop: 'fill' }],
  },
});

// ── Cloudinary storage for message media (supports image, video, raw) ──
const mediaStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    return {
      folder: 'echochat/messages',
      resource_type: 'auto', // Detects images, videos, or raw files automatically
    };
  },
});

// ── File filter ───────────────────────────────────────────────
const fileFilter = (allowedMimeTypes) => (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(ApiError.badRequest(`File type '${file.mimetype}' is not supported.`), false);
  }
};

const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const MEDIA_TYPES = [
  ...AVATAR_TYPES,
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/zip',
  'application/x-zip-compressed',
];

// ── Multer instances ──────────────────────────────────────────

/** For avatar uploads — single file, max 5MB */
export const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter(AVATAR_TYPES),
}).single('avatar');

/** For cover uploads — single file, max 5MB */
export const uploadCover = multer({
  storage: coverStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter(AVATAR_TYPES),
}).single('cover');

/** For message media — single file, max 25MB (increased to support video/zip) */
export const uploadMedia = multer({
  storage: mediaStorage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: fileFilter(MEDIA_TYPES),
}).single('file');
