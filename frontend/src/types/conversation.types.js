/**
 * @typedef {Object} Conversation
 * @property {string} _id
 * @property {'direct' | 'group'} type
 * @property {User[]} participants
 * @property {string} [name]
 * @property {{ url: string, publicId: string }} [groupAvatar]
 * @property {string} [admin]
 * @property {Message | null} lastMessage
 * @property {string} createdAt
 * @property {string} updatedAt
 */

export {};
