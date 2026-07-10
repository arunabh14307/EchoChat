import * as groupService from './group.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import ApiError from '../../utils/ApiError.js';
import { triggerNotification } from '../notifications/notification.controller.js';

// Helper to safely trigger real-time updates to group socket room
const broadcastGroupUpdate = (req, groupId, event, data) => {
  if (req.io) {
    req.io.to(groupId.toString()).emit(event, data);
  }
};

// ── POST /api/groups ───────────────────────────────────────────
export const createGroup = async (req, res, next) => {
  try {
    const { name, description, memberIds } = req.body;
    let avatar = { url: '', publicId: '' };

    if (req.file) {
      avatar = {
        url: req.file.path,
        publicId: req.file.filename,
      };
    }

    const group = await groupService.createGroup({
      name,
      description,
      creatorId: req.user.userId,
      memberIds,
      avatar,
    });

    // Alert participants about group creation
    if (memberIds && memberIds.length > 0) {
      for (const memberId of memberIds) {
        await triggerNotification(req.io, {
          recipient: memberId,
          sender: req.user.userId,
          type: 'group_created',
          title: 'Group Created',
          body: `You were added to the new group "${group.name}"`,
          conversation: group._id,
        });
      }
    }

    res.status(201).json(
      new ApiResponse(201, 'Group created successfully', { group })
    );
  } catch (error) {
    next(error);
  }
};

// ── GET /api/groups/:id ────────────────────────────────────────
export const getGroup = async (req, res, next) => {
  try {
    const group = await groupService.getGroupDetails(req.params.id, req.user.userId);
    res.status(200).json(
      new ApiResponse(200, 'Group details loaded successfully', { group })
    );
  } catch (error) {
    next(error);
  }
};

// ── PATCH /api/groups/:id ──────────────────────────────────────
export const updateGroup = async (req, res, next) => {
  try {
    const group = await groupService.updateGroup(
      req.params.id,
      req.user.userId,
      req.body,
      req.file
    );

    // Broadcast system message alert and updated model
    broadcastGroupUpdate(req, group._id, 'group_updated', { group });

    res.status(200).json(
      new ApiResponse(200, 'Group details updated successfully', { group })
    );
  } catch (error) {
    next(error);
  }
};

// ── DELETE /api/groups/:id ─────────────────────────────────────
export const deleteGroup = async (req, res, next) => {
  try {
    const group = await groupService.deleteGroup(req.params.id, req.user.userId);

    // Alert group participants about deletion
    broadcastGroupUpdate(req, group._id, 'group_deleted', { groupId: group._id });

    res.status(200).json(
      new ApiResponse(200, 'Group deleted successfully', { groupId: group._id })
    );
  } catch (error) {
    next(error);
  }
};

// ── POST /api/groups/:id/members ───────────────────────────────
export const addMembers = async (req, res, next) => {
  try {
    const { userIds } = req.body;
    const group = await groupService.addMembers(req.params.id, req.user.userId, userIds);

    // Broadcast to room
    broadcastGroupUpdate(req, group._id, 'group_updated', { group });
    broadcastGroupUpdate(req, group._id, 'member_joined', { groupId: group._id, userIds });

    // Send notifications to added users
    for (const addedId of userIds) {
      await triggerNotification(req.io, {
        recipient: addedId,
        sender: req.user.userId,
        type: 'member_added',
        title: 'Added to group',
        body: `You were added to the group "${group.name}"`,
        conversation: group._id,
      });
    }

    res.status(200).json(
      new ApiResponse(200, 'Members added successfully', { group })
    );
  } catch (error) {
    next(error);
  }
};

// ── DELETE /api/groups/:id/members/:userId ────────────────────
export const removeMember = async (req, res, next) => {
  try {
    const groupId = req.params.id;
    const targetUserId = req.params.userId;

    const group = await groupService.removeMember(groupId, req.user.userId, targetUserId);

    if (!group) {
      // Group was deleted (Owner left alone)
      broadcastGroupUpdate(req, groupId, 'group_deleted', { groupId });
      return res.status(200).json(
        new ApiResponse(200, 'Group deleted because last member left', { groupId })
      );
    }

    // Broadcast update
    broadcastGroupUpdate(req, group._id, 'group_updated', { group });
    broadcastGroupUpdate(req, group._id, 'member_left', { groupId: group._id, userId: targetUserId });

    // Trigger notification if kicked (not self leave)
    if (targetUserId !== req.user.userId) {
      await triggerNotification(req.io, {
        recipient: targetUserId,
        sender: req.user.userId,
        type: 'member_removed',
        title: 'Removed from group',
        body: `You were removed from the group "${group.name}"`,
        conversation: groupId,
      });
    }

    res.status(200).json(
      new ApiResponse(200, 'Member removed successfully', { group })
    );
  } catch (error) {
    next(error);
  }
};

// ── PATCH /api/groups/:id/promote ──────────────────────────────
export const promoteToAdmin = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const group = await groupService.promoteToAdmin(req.params.id, req.user.userId, userId);

    broadcastGroupUpdate(req, group._id, 'group_updated', { group });
    broadcastGroupUpdate(req, group._id, 'member_promoted', { groupId: group._id, userId });

    // Send promotion notification
    await triggerNotification(req.io, {
      recipient: userId,
      sender: req.user.userId,
      type: 'admin_promoted',
      title: 'Promoted to Admin',
      body: `You were promoted to admin in the group "${group.name}"`,
      conversation: group._id,
    });

    res.status(200).json(
      new ApiResponse(200, 'Member promoted to admin successfully', { group })
    );
  } catch (error) {
    next(error);
  }
};

// ── PATCH /api/groups/:id/demote ───────────────────────────────
export const demoteFromAdmin = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const group = await groupService.demoteFromAdmin(req.params.id, req.user.userId, userId);

    broadcastGroupUpdate(req, group._id, 'group_updated', { group });
    broadcastGroupUpdate(req, group._id, 'member_demoted', { groupId: group._id, userId });

    // Send demotion notification
    await triggerNotification(req.io, {
      recipient: userId,
      sender: req.user.userId,
      type: 'admin_demoted',
      title: 'Demoted from Admin',
      body: `You were demoted to member in the group "${group.name}"`,
      conversation: group._id,
    });

    res.status(200).json(
      new ApiResponse(200, 'Admin demoted successfully', { group })
    );
  } catch (error) {
    next(error);
  }
};

// ── POST /api/groups/invite/regenerate ─────────────────────────
export const regenerateInviteCode = async (req, res, next) => {
  try {
    const { groupId, expiry } = req.body;
    const group = await groupService.regenerateInviteCode(groupId, req.user.userId, expiry);

    // Broadcast update containing new code
    broadcastGroupUpdate(req, group._id, 'group_updated', { group });

    res.status(200).json(
      new ApiResponse(200, 'Invite code regenerated successfully', {
        inviteCode: group.inviteCode,
      })
    );
  } catch (error) {
    next(error);
  }
};

// ── POST /api/groups/join ──────────────────────────────────────
export const joinGroup = async (req, res, next) => {
  try {
    const { inviteCode } = req.body;
    const group = await groupService.joinGroupWithInvite(inviteCode, req.user.userId);

    // Broadcast member joined
    broadcastGroupUpdate(req, group._id, 'group_updated', { group });
    broadcastGroupUpdate(req, group._id, 'member_joined', {
      groupId: group._id,
      userIds: [req.user.userId],
    });

    // Notify other admins about user joining
    if (group.admins && group.admins.length > 0) {
      for (const adminId of group.admins) {
        if (adminId.toString() !== req.user.userId.toString()) {
          await triggerNotification(req.io, {
            recipient: adminId,
            sender: req.user.userId,
            type: 'group_join',
            title: 'New member joined',
            body: `${req.user.username} joined the group "${group.name}" via invite link`,
            conversation: group._id,
          });
        }
      }
    }

    res.status(200).json(
      new ApiResponse(200, 'Joined group successfully', { group })
    );
  } catch (error) {
    next(error);
  }
};
