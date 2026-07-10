/**
 * @typedef {Object} Message
 * @property {string} _id
 * @property {string} conversationId
 * @property {User} sender
 * @property {'text' | 'image' | 'file' | 'system'} type
 * @property {string} content
 * @property {{ url: string, publicId: string, name: string, size: number, mimeType: string }} media
 * @property {Array<{ user: string, readAt: string }>} readBy
 * @property {boolean} isDeleted
 * @property {string} createdAt
 * @property {string} updatedAt
 */

export {};
