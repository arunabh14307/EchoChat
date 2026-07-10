/**
 * Socket event name constants — shared between handlers.
 * Mirror these in the client's utils/constants.js.
 */
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
