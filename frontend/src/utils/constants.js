/**
 * App-wide constants. Import from here — never hardcode these inline.
 */

// ── API ───────────────────────────────────────────────────────
const isProduction = import.meta.env.PROD;
export const API_URL = import.meta.env.VITE_API_URL || (isProduction ? '/api' : 'http://localhost:5000/api');
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (isProduction ? (typeof window !== 'undefined' ? window.location.origin : '') : 'http://localhost:5000');


// ── Pagination ────────────────────────────────────────────────
export const MESSAGES_PER_PAGE = 40;
export const CONVERSATIONS_PER_PAGE = 30;
export const USERS_SEARCH_LIMIT = 20;

// ── Message types ─────────────────────────────────────────────
export const MESSAGE_TYPE = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
  SYSTEM: 'system',
};

// ── Conversation types ────────────────────────────────────────
export const CONVERSATION_TYPE = {
  DIRECT: 'direct',
  GROUP: 'group',
};

// ── Socket events (client → server) ──────────────────────────
export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',

  // Messaging
  SEND_MESSAGE: 'send_message',
  NEW_MESSAGE: 'new_message',

  // Typing
  TYPING_START: 'typing_start',
  TYPING_STOP: 'typing_stop',
  USER_TYPING: 'user_typing',

  // Read receipts
  MESSAGE_READ: 'message_read',
  MESSAGES_READ: 'messages_read',

  // Presence
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',
  GET_ONLINE_USERS: 'get_online_users',
  ONLINE_USERS: 'online_users',

  // Rooms
  JOIN_CONVERSATION: 'join_conversation',
  LEAVE_CONVERSATION: 'leave_conversation',
};

// ── File upload limits ────────────────────────────────────────
export const MAX_FILE_SIZE_MB = 10;
export const MAX_IMAGE_SIZE_MB = 5;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_FILE_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// ── Debounce delays (ms) ──────────────────────────────────────
export const TYPING_DEBOUNCE_MS = 1000;
export const SEARCH_DEBOUNCE_MS = 400;

// ── Avatar fallback ───────────────────────────────────────────
export const DEFAULT_AVATAR_URL = 'https://api.dicebear.com/7.x/initials/svg';
