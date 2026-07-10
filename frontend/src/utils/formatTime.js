import { formatDistanceToNow, format, isToday, isYesterday, parseISO } from 'date-fns';

/**
 * Format a timestamp for use in message bubbles.
 * Returns "HH:mm" (e.g. "14:30").
 * @param {string | Date} timestamp
 * @returns {string}
 */
export const formatMessageTime = (timestamp) => {
  try {
    const date = typeof timestamp === 'string' ? parseISO(timestamp) : timestamp;
    return format(date, 'HH:mm');
  } catch {
    return '';
  }
};

/**
 * Format a timestamp for conversation list previews.
 * - Today: "HH:mm"
 * - Yesterday: "Yesterday"
 * - Within a week: "Mon", "Tue", etc.
 * - Older: "DD/MM/YYYY"
 * @param {string | Date} timestamp
 * @returns {string}
 */
export const formatConversationTime = (timestamp) => {
  try {
    const date = typeof timestamp === 'string' ? parseISO(timestamp) : timestamp;

    if (isToday(date)) {
      return format(date, 'HH:mm');
    }
    if (isYesterday(date)) {
      return 'Yesterday';
    }
    const daysAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (daysAgo < 7) {
      return format(date, 'EEE'); // "Mon", "Tue", etc.
    }
    return format(date, 'dd/MM/yyyy');
  } catch {
    return '';
  }
};

/**
 * Format a timestamp as relative time (e.g. "3 minutes ago").
 * @param {string | Date} timestamp
 * @returns {string}
 */
export const formatRelativeTime = (timestamp) => {
  try {
    const date = typeof timestamp === 'string' ? parseISO(timestamp) : timestamp;
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return '';
  }
};

/**
 * Format "last seen" text.
 * @param {string | Date | null} timestamp
 * @returns {string}
 */
export const formatLastSeen = (timestamp) => {
  if (!timestamp) {
    return 'Last seen a while ago';
  }
  try {
    const date = typeof timestamp === 'string' ? parseISO(timestamp) : timestamp;
    if (isToday(date)) {
      return `Last seen today at ${format(date, 'HH:mm')}`;
    }
    if (isYesterday(date)) {
      return `Last seen yesterday at ${format(date, 'HH:mm')}`;
    }
    return `Last seen ${format(date, 'dd MMM')} at ${format(date, 'HH:mm')}`;
  } catch {
    return 'Last seen a while ago';
  }
};
