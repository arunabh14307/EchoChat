import crypto from 'crypto';
import Conversation from '../../models/Conversation.model.js';
import Message from '../../models/Message.model.js';
import User from '../../models/User.model.js';
import ApiError from '../../utils/ApiError.js';

// Helper to create and broadcast system messages
const createSystemMessage = async (conversationId, content) => {
  const message = await Message.create({
    conversation: conversationId,
    sender: null,
    content,
    messageType: 'system',
    seenBy: [],
  });

  return await Message.findById(message._id);
};

/**
 * createGroup — Create a private WhatsApp-like group.
 */
export const createGroup = async ({ name, description, creatorId, memberIds = [], avatar }) => {
  const creator = await User.findById(creatorId);
  if (!creator) {
    throw ApiError.notFound('Creator user not found');
  }

  // Generate random 8-character invite code
  const code = crypto.randomBytes(4).toString('hex');

  // Merge members and ensure creator is part of participants
  const allParticipants = Array.from(new Set([creatorId, ...memberIds]));

  const newGroup = await Conversation.create({
    type: 'group',
    isGroup: true,
    name,
    groupDescription: description || '',
    groupAvatar: avatar || { url: '', publicId: '' },
    participants: allParticipants,
    admins: [creatorId],
    createdBy: creatorId,
    inviteCode: {
      code,
      expiresAt: null,
    },
    unreadCounts: allParticipants.map((id) => ({ user: id, count: 0 })),
  });

  // Create system message: "Group Created"
  const systemMsg = await createSystemMessage(
    newGroup._id,
    `${creator.displayName || creator.username} created the group "${name}"`
  );

  newGroup.lastMessage = systemMsg._id;
  newGroup.lastMessageAt = systemMsg.createdAt;
  await newGroup.save();

  return await Conversation.findById(newGroup._id)
    .populate('participants')
    .populate('lastMessage');
};

/**
 * getGroupDetails — Get group info.
 */
export const getGroupDetails = async (groupId, userId) => {
  const group = await Conversation.findById(groupId)
    .populate('participants')
    .populate('lastMessage');

  if (!group || !group.isGroup) {
    throw ApiError.notFound('Group not found');
  }

  const isParticipant = group.participants.some((p) => p._id.toString() === userId.toString());
  if (!isParticipant) {
    throw ApiError.forbidden('You are not a participant in this group');
  }

  return group;
};

/**
 * updateGroup — Edit name, description, avatar.
 */
export const updateGroup = async (groupId, userId, { name, description }, avatarFile) => {
  const group = await Conversation.findById(groupId);
  if (!group || !group.isGroup) {
    throw ApiError.notFound('Group not found');
  }

  const user = await User.findById(userId);
  const isAdmin = group.admins.some((id) => id.toString() === userId.toString());
  if (!isAdmin) {
    throw ApiError.forbidden('Only admins can edit group settings');
  }

  let systemContent = '';

  if (name && name !== group.name) {
    systemContent = `${user.displayName || user.username} changed group name to "${name}"`;
    group.name = name;
  }

  if (description !== undefined) {
    group.groupDescription = description;
  }

  if (avatarFile) {
    group.groupAvatar = {
      url: avatarFile.path,
      publicId: avatarFile.filename,
    };
    const prefix = systemContent ? systemContent + ' and ' : '';
    systemContent = `${prefix}${user.displayName || user.username} updated group icon`;
  }

  await group.save();

  if (systemContent) {
    const systemMsg = await createSystemMessage(group._id, systemContent);
    group.lastMessage = systemMsg._id;
    group.lastMessageAt = systemMsg.createdAt;
    await group.save();
  }

  return await Conversation.findById(group._id)
    .populate('participants')
    .populate('lastMessage');
};

/**
 * deleteGroup — Delete group and all associated messages.
 */
export const deleteGroup = async (groupId, userId) => {
  const group = await Conversation.findById(groupId);
  if (!group || !group.isGroup) {
    throw ApiError.notFound('Group not found');
  }

  if (group.createdBy.toString() !== userId.toString()) {
    throw ApiError.forbidden('Only the group owner can delete this group');
  }

  await Message.deleteMany({ conversation: groupId });
  await Conversation.findByIdAndDelete(groupId);

  return group;
};

/**
 * addMembers — Add multiple users to group.
 */
export const addMembers = async (groupId, adminId, userIds = []) => {
  const group = await Conversation.findById(groupId);
  if (!group || !group.isGroup) {
    throw ApiError.notFound('Group not found');
  }

  const admin = await User.findById(adminId);
  const isAdmin = group.admins.some((id) => id.toString() === adminId.toString());
  if (!isAdmin) {
    throw ApiError.forbidden('Only admins can add members');
  }

  const addedUsers = await User.find({ _id: { $in: userIds } });
  if (addedUsers.length === 0) {
    throw ApiError.badRequest('No valid users specified to add');
  }

  let lastMsgId = group.lastMessage;
  let lastMsgAt = group.lastMessageAt;

  for (const targetUser of addedUsers) {
    const isAlreadyMember = group.participants.some(
      (id) => id.toString() === targetUser._id.toString()
    );

    if (!isAlreadyMember) {
      group.participants.push(targetUser._id);
      group.unreadCounts.push({ user: targetUser._id, count: 0 });

      // Create system message: "Member Added"
      const systemMsg = await createSystemMessage(
        group._id,
        `${admin.displayName || admin.username} added ${targetUser.displayName || targetUser.username}`
      );
      lastMsgId = systemMsg._id;
      lastMsgAt = systemMsg.createdAt;
    }
  }

  group.lastMessage = lastMsgId;
  group.lastMessageAt = lastMsgAt;
  await group.save();

  return await Conversation.findById(group._id)
    .populate('participants')
    .populate('lastMessage');
};

/**
 * removeMember — Kick a user or handle leaving.
 */
export const removeMember = async (groupId, triggeringUserId, targetUserId) => {
  const group = await Conversation.findById(groupId);
  if (!group || !group.isGroup) {
    throw ApiError.notFound('Group not found');
  }

  const triggerUser = await User.findById(triggeringUserId);
  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    throw ApiError.notFound('Target user not found');
  }

  const isSelf = triggeringUserId.toString() === targetUserId.toString();
  const isAdmin = group.admins.some((id) => id.toString() === triggeringUserId.toString());

  // Kicking checks
  if (!isSelf && !isAdmin) {
    throw ApiError.forbidden('Only admins can remove members');
  }

  // Admins cannot kick owner
  if (!isSelf && group.createdBy.toString() === targetUserId.toString()) {
    throw ApiError.forbidden('Admins cannot remove the group owner');
  }

  // Owner leaves logic (Owner transfer rules)
  if (isSelf && group.createdBy.toString() === targetUserId.toString()) {
    // If owner is the only member, delete group
    if (group.participants.length <= 1) {
      await Message.deleteMany({ conversation: groupId });
      await Conversation.findByIdAndDelete(groupId);
      return null;
    }

    // Transfer ownership to oldest admin (first admin excluding owner)
    const otherAdmins = group.admins.filter((id) => id.toString() !== targetUserId.toString());
    if (otherAdmins.length > 0) {
      group.createdBy = otherAdmins[0];
    } else {
      // Transfer to oldest member (first participant excluding owner)
      const otherMembers = group.participants.filter(
        (id) => id.toString() !== targetUserId.toString()
      );
      group.createdBy = otherMembers[0];
      // Automatically promote them to admin
      group.admins.push(otherMembers[0]);
    }
  }

  // Pull out participant
  group.participants = group.participants.filter((id) => id.toString() !== targetUserId.toString());
  group.admins = group.admins.filter((id) => id.toString() !== targetUserId.toString());
  group.unreadCounts = group.unreadCounts.filter(
    (item) => item.user.toString() !== targetUserId.toString()
  );

  // Create system message
  const systemContent = isSelf
    ? `${targetUser.displayName || targetUser.username} left the group`
    : `${triggerUser.displayName || triggerUser.username} removed ${targetUser.displayName || targetUser.username}`;

  const systemMsg = await createSystemMessage(group._id, systemContent);
  group.lastMessage = systemMsg._id;
  group.lastMessageAt = systemMsg.createdAt;
  await group.save();

  return await Conversation.findById(group._id)
    .populate('participants')
    .populate('lastMessage');
};

/**
 * promoteToAdmin — Promote regular member to admin.
 */
export const promoteToAdmin = async (groupId, adminId, targetUserId) => {
  const group = await Conversation.findById(groupId);
  if (!group || !group.isGroup) {
    throw ApiError.notFound('Group not found');
  }

  const admin = await User.findById(adminId);
  const targetUser = await User.findById(targetUserId);

  const isAdmin = group.admins.some((id) => id.toString() === adminId.toString());
  if (!isAdmin) {
    throw ApiError.forbidden('Only admins can promote other members');
  }

  const isMember = group.participants.some((id) => id.toString() === targetUserId.toString());
  if (!isMember) {
    throw ApiError.badRequest('Target user is not a member of this group');
  }

  const isAlreadyAdmin = group.admins.some((id) => id.toString() === targetUserId.toString());
  if (isAlreadyAdmin) {
    return group;
  }

  group.admins.push(targetUserId);

  const systemMsg = await createSystemMessage(
    group._id,
    `${admin.displayName || admin.username} promoted ${targetUser.displayName || targetUser.username} to admin`
  );
  group.lastMessage = systemMsg._id;
  group.lastMessageAt = systemMsg.createdAt;
  await group.save();

  return await Conversation.findById(group._id)
    .populate('participants')
    .populate('lastMessage');
};

/**
 * demoteFromAdmin — Demote admin to member (owner only).
 */
export const demoteFromAdmin = async (groupId, ownerId, targetUserId) => {
  const group = await Conversation.findById(groupId);
  if (!group || !group.isGroup) {
    throw ApiError.notFound('Group not found');
  }

  const owner = await User.findById(ownerId);
  const targetUser = await User.findById(targetUserId);

  // Only owner can demote admins
  if (group.createdBy.toString() !== ownerId.toString()) {
    throw ApiError.forbidden('Only the group owner can demote admins');
  }

  if (targetUserId.toString() === ownerId.toString()) {
    throw ApiError.badRequest('You cannot demote yourself from admin/owner');
  }

  const isAlreadyAdmin = group.admins.some((id) => id.toString() === targetUserId.toString());
  if (!isAlreadyAdmin) {
    return group;
  }

  group.admins = group.admins.filter((id) => id.toString() !== targetUserId.toString());

  const systemMsg = await createSystemMessage(
    group._id,
    `${owner.displayName || owner.username} demoted ${targetUser.displayName || targetUser.username} to member`
  );
  group.lastMessage = systemMsg._id;
  group.lastMessageAt = systemMsg.createdAt;
  await group.save();

  return await Conversation.findById(group._id)
    .populate('participants')
    .populate('lastMessage');
};

/**
 * regenerateInviteCode — Regenerate invite links with expiries.
 */
export const regenerateInviteCode = async (groupId, adminId, expiryOption = 'never') => {
  const group = await Conversation.findById(groupId);
  if (!group || !group.isGroup) {
    throw ApiError.notFound('Group not found');
  }

  const isAdmin = group.admins.some((id) => id.toString() === adminId.toString());
  if (!isAdmin) {
    throw ApiError.forbidden('Only admins can regenerate the invite code');
  }

  // Calculate expiration
  let expiresAt = null;
  const now = new Date();
  if (expiryOption === '24h') {
    expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  } else if (expiryOption === '7d') {
    expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  } else if (expiryOption === '30d') {
    expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  }

  const code = crypto.randomBytes(4).toString('hex');
  group.inviteCode = { code, expiresAt };
  await group.save();

  return group;
};

/**
 * joinGroupWithInvite — Join group via invite links.
 */
export const joinGroupWithInvite = async (code, userId) => {
  const group = await Conversation.findOne({ 'inviteCode.code': code });
  if (!group) {
    throw ApiError.notFound('Group invite code not found');
  }

  // Check expiry
  if (group.inviteCode.expiresAt && new Date(group.inviteCode.expiresAt) < new Date()) {
    throw ApiError.badRequest('This group invite code has expired');
  }

  const user = await User.findById(userId);

  const isAlreadyMember = group.participants.some((id) => id.toString() === userId.toString());
  if (isAlreadyMember) {
    return await Conversation.findById(group._id)
      .populate('participants')
      .populate('lastMessage');
  }

  group.participants.push(userId);
  group.unreadCounts.push({ user: userId, count: 0 });

  const systemMsg = await createSystemMessage(
    group._id,
    `${user.displayName || user.username} joined via invite link`
  );
  group.lastMessage = systemMsg._id;
  group.lastMessageAt = systemMsg.createdAt;
  await group.save();

  return await Conversation.findById(group._id)
    .populate('participants')
    .populate('lastMessage');
};
