import React, { useState, useEffect } from 'react';
import { X, Camera, Shield, UserMinus, UserCheck, Link2, RefreshCw, LogOut, Trash2, Search, Plus, Key } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import { useAuthStore } from '@store/authStore';
import { useChatStore } from '@store/chatStore';
import groupService from '@services/groupService';
import userService from '@services/userService';
import toast from 'react-hot-toast';

/**
 * GroupSettingsModal — settings drawer covering edit info, members kick/promotion lists, invite link codes, and deletions.
 *
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void
 * }} props
 */
const GroupSettingsModal = ({ isOpen, onClose }) => {
  const { user: currentUser } = useAuthStore();
  const { activeConversationId, getActiveConversation, updateConversation, removeConversation } =
    useChatStore();

  const conversation = getActiveConversation();
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'members' | 'invites'

  // Metadata edit states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Invite Link states
  const [inviteCode, setInviteCode] = useState('');
  const [inviteExpiry, setInviteExpiry] = useState('never');
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Members lists & Search additions states
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [memberSearchResults, setMemberSearchResults] = useState([]);
  const [isSearchingMembers, setIsSearchingMembers] = useState(false);

  useEffect(() => {
    if (conversation && isOpen) {
      setName(conversation.name || '');
      setDescription(conversation.groupDescription || '');
      setAvatarPreview(conversation.groupAvatar?.url || '');
      setInviteCode(conversation.inviteCode?.code || '');
    }
  }, [conversation, isOpen]);

  // Debounced search for adding new members
  useEffect(() => {
    if (activeTab !== 'members' || !memberSearchQuery.trim()) {
      setMemberSearchResults([]);
      return;
    }

    const delay = setTimeout(async () => {
      setIsSearchingMembers(true);
      try {
        const { data } = await userService.searchUsers(memberSearchQuery);
        // Exclude users already in group
        const filtered = (data.users || []).filter(
          (u) => !conversation.participants.some((p) => p._id === u._id)
        );
        setMemberSearchResults(filtered);
      } catch {
        toast.error('Failed to search users');
      } finally {
        setIsSearchingMembers(false);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [memberSearchQuery, activeTab, conversation]);

  if (!conversation || !conversation.isGroup) {
    return null;
  }

  const isOwner = conversation.createdBy === currentUser?._id;
  const isAdmin = conversation.admins?.includes(currentUser?._id) || isOwner;

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const response = await groupService.updateGroup(conversation._id, {
        name: name.trim(),
        description: description.trim(),
        avatar,
      });

      updateConversation(conversation._id, response.group);
      toast.success('Group settings updated');
      setAvatar(null);
    } catch (err) {
      const msg = err.response?.data?.message || 'Update failed';
      toast.error(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  // Add Member Action
  const handleAddMember = async (userId) => {
    try {
      const response = await groupService.addMembers(conversation._id, [userId]);
      updateConversation(conversation._id, response.group);
      setMemberSearchQuery('');
      toast.success('Member added successfully');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add member';
      toast.error(msg);
    }
  };

  // Kick member action
  const handleKickMember = async (userId) => {
    try {
      const response = await groupService.removeMember(conversation._id, userId);
      updateConversation(conversation._id, response.group);
      toast.success('Member removed');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to remove member';
      toast.error(msg);
    }
  };

  // Leave Group action
  const handleLeaveGroup = async () => {
    if (isOwner && conversation.participants.length > 1) {
      const otherAdmins = conversation.admins?.filter((id) => id !== currentUser?._id) || [];
      const oldestAdmin = otherAdmins[0];
      const oldestMember = conversation.participants.find((p) => p._id !== currentUser?._id);

      const nextInLine = oldestAdmin
        ? oldestAdmin
        : oldestMember?._id;

      if (!confirm(`As owner, leaving will transfer ownership to next member in line. Continue?`)) {
        return;
      }
    } else {
      if (!confirm('Are you sure you want to leave this group?')) {
        return;
      }
    }

    try {
      await groupService.removeMember(conversation._id, currentUser?._id);
      removeConversation(conversation._id);
      toast.success('You left the group');
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to leave group';
      toast.error(msg);
    }
  };

  // Delete Group action
  const handleDeleteGroup = async () => {
    if (!confirm('CRITICAL: This will delete the group and all messages permanently. Proceed?')) {
      return;
    }

    try {
      await groupService.deleteGroup(conversation._id);
      removeConversation(conversation._id);
      toast.success('Group deleted permanently');
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete group';
      toast.error(msg);
    }
  };

  // Promote Member to admin
  const handlePromote = async (userId) => {
    try {
      const response = await groupService.promoteToAdmin(conversation._id, userId);
      updateConversation(conversation._id, response.group);
      toast.success('User promoted to Admin');
    } catch (err) {
      const msg = err.response?.data?.message || 'Promotion failed';
      toast.error(msg);
    }
  };

  // Demote Admin to Member
  const handleDemote = async (userId) => {
    try {
      const response = await groupService.demoteFromAdmin(conversation._id, userId);
      updateConversation(conversation._id, response.group);
      toast.success('User demoted to Member');
    } catch (err) {
      const msg = err.response?.data?.message || 'Demotion failed';
      toast.error(msg);
    }
  };

  // Regenerate Invite code
  const handleRegenerateCode = async () => {
    setIsRegenerating(true);
    try {
      const response = await groupService.regenerateInviteCode(conversation._id, inviteExpiry);
      setInviteCode(response.inviteCode.code);
      // Sync conversation metadata
      updateConversation(conversation._id, {
        inviteCode: response.inviteCode,
      });
      toast.success('Invite link regenerated');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to regenerate';
      toast.error(msg);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleCopyLink = () => {
    const inviteLink = `${window.location.origin}/join/${inviteCode}`;
    navigator.clipboard.writeText(inviteLink);
    toast.success('Invite link copied to clipboard!');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Group Settings" size="md">
      <div className="flex flex-col gap-5 max-h-[75vh] select-none">
        {/* Navigation Tabs */}
        <div className="flex border-b border-surface-800 shrink-0">
          <button
            onClick={() => setActiveTab('details')}
            className={`
              flex-1 pb-3 text-xs font-bold border-b-2 tracking-wider uppercase transition-all cursor-pointer
              ${
                activeTab === 'details'
                  ? 'border-primary-500 text-primary-400 font-extrabold'
                  : 'border-transparent text-surface-400 hover:text-surface-200'
              }
            `}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`
              flex-1 pb-3 text-xs font-bold border-b-2 tracking-wider uppercase transition-all cursor-pointer
              ${
                activeTab === 'members'
                  ? 'border-primary-500 text-primary-400 font-extrabold'
                  : 'border-transparent text-surface-400 hover:text-surface-200'
              }
            `}
          >
            Members ({conversation.participants.length})
          </button>
          <button
            onClick={() => setActiveTab('invites')}
            className={`
              flex-1 pb-3 text-xs font-bold border-b-2 tracking-wider uppercase transition-all cursor-pointer
              ${
                activeTab === 'invites'
                  ? 'border-primary-500 text-primary-400 font-extrabold'
                  : 'border-transparent text-surface-400 hover:text-surface-200'
              }
            `}
          >
            Invite Code
          </button>
        </div>

        {/* Tab Viewports */}
        <div className="flex-1 overflow-y-auto pr-1 scroll-hidden">
          {activeTab === 'details' && (
            <form onSubmit={handleSaveDetails} className="flex flex-col gap-4">
              {/* Group icon selector */}
              <div className="flex flex-col items-center gap-2 py-2">
                <div className="relative group w-20 h-20 rounded-full border border-surface-800 bg-surface-900 flex items-center justify-center overflow-hidden">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="group" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-surface-400">G</span>
                  )}
                  {isAdmin && (
                    <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera className="w-5 h-5 text-white" />
                      <input type="file" onChange={handleAvatarChange} accept="image/*" className="hidden" />
                    </label>
                  )}
                </div>
                <span className="text-3xs text-surface-500 uppercase tracking-widest font-bold">Group Avatar</span>
              </div>

              {/* Title & Description Fields */}
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-2xs text-surface-400 font-bold uppercase tracking-wider">Group Name</label>
                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-surface-900 border border-surface-800 rounded-xl px-4 py-2.5 text-sm text-surface-100 placeholder-surface-600 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-2xs text-surface-400 font-bold uppercase tracking-wider">Description</label>
                  <textarea
                    disabled={!isAdmin}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="bg-surface-900 border border-surface-800 rounded-xl px-4 py-2.5 text-sm text-surface-100 placeholder-surface-600 focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none disabled:opacity-50"
                  />
                </div>
              </div>

              {isAdmin && (
                <div className="flex justify-end pt-2">
                  <Button type="submit" variant="primary" loading={isUpdating}>
                    Save Changes
                  </Button>
                </div>
              )}
            </form>
          )}

          {activeTab === 'members' && (
            <div className="flex flex-col gap-4">
              {/* Add member search block (Admins only) */}
              {isAdmin && (
                <div className="flex flex-col gap-2 bg-surface-900/40 border border-surface-800/80 p-3 rounded-xl">
                  <label className="text-2xs text-surface-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Member</span>
                  </label>
                  <div className="relative mt-1">
                    <Search className="w-4 h-4 text-surface-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={memberSearchQuery}
                      onChange={(e) => setMemberSearchQuery(e.target.value)}
                      placeholder="Type username to search..."
                      className="w-full bg-surface-950 border border-surface-800 rounded-lg pl-9 pr-3 py-2 text-xs text-surface-200 placeholder-surface-600 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>

                  {/* Add Search Results List */}
                  <div className="max-h-28 overflow-y-auto flex flex-col gap-1 mt-1 scroll-hidden">
                    {isSearchingMembers ? (
                      <span className="text-3xs text-surface-500 text-center py-2">Searching...</span>
                    ) : memberSearchResults.length > 0 ? (
                      memberSearchResults.map((user) => (
                        <div
                          key={user._id}
                          className="flex items-center justify-between p-2 hover:bg-surface-900 rounded-lg"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Avatar src={user.avatar?.url} username={user.displayName || user.username} size="xs" />
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-semibold text-surface-200 truncate">
                                {user.displayName || user.username}
                              </span>
                              <span className="text-3xs text-surface-500 truncate">@{user.username}</span>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            onClick={() => handleAddMember(user._id)}
                            className="px-2.5 py-1 text-2xs rounded-md"
                          >
                            Add
                          </Button>
                        </div>
                      ))
                    ) : memberSearchQuery.trim() ? (
                      <span className="text-3xs text-surface-500 text-center py-2">No users found</span>
                    ) : null}
                  </div>
                </div>
              )}

              {/* Members lists layout */}
              <div className="flex flex-col gap-2">
                <label className="text-2xs text-surface-400 font-bold uppercase tracking-wider">Group Members</label>
                <div className="flex flex-col gap-1.5">
                  {conversation.participants.map((member) => {
                    const isTargetOwner = conversation.createdBy === member._id;
                    const isTargetAdmin = conversation.admins?.includes(member._id) || isTargetOwner;

                    return (
                      <div
                        key={member._id}
                        className="flex items-center justify-between p-2 hover:bg-surface-900/60 rounded-xl border border-transparent hover:border-surface-800/40"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar
                            src={member.avatar?.url}
                            username={member.displayName || member.username}
                            size="xs"
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold text-surface-200 truncate flex items-center gap-1.5">
                              <span>{member.displayName || member.username}</span>
                              {member._id === currentUser?._id && (
                                <span className="text-[9px] bg-surface-800 text-surface-400 px-1 py-0.5 rounded select-none">
                                  You
                                </span>
                              )}
                            </span>
                            <span className="text-3xs text-surface-500 truncate">@{member.username}</span>
                          </div>
                        </div>

                        {/* Badges & Admin Actions */}
                        <div className="flex items-center gap-2">
                          {isTargetOwner ? (
                            <span className="text-[9px] font-bold text-warning-400 bg-warning-950/20 border border-warning-500/20 px-2 py-0.5 rounded-full select-none">
                              Owner
                            </span>
                          ) : isTargetAdmin ? (
                            <span className="text-[9px] font-bold text-primary-400 bg-primary-950/20 border border-primary-500/20 px-2 py-0.5 rounded-full select-none">
                              Admin
                            </span>
                          ) : null}

                          {/* Member actions (Admins only, target not Owner or self) */}
                          {isAdmin && member._id !== currentUser?._id && !isTargetOwner && (
                            <div className="flex items-center gap-1">
                              {/* Promotion toggle */}
                              {!isTargetAdmin ? (
                                <button
                                  onClick={() => handlePromote(member._id)}
                                  className="p-1 rounded bg-surface-800 hover:bg-surface-700 text-primary-400 transition-colors"
                                  title="Promote to Admin"
                                >
                                  <Shield className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                // Demotion (only owners can demote)
                                isOwner && (
                                  <button
                                    onClick={() => handleDemote(member._id)}
                                    className="p-1 rounded bg-surface-800 hover:bg-surface-700 text-warning-400 transition-colors"
                                    title="Demote to Member"
                                  >
                                    <Shield className="w-3.5 h-3.5 opacity-60" />
                                  </button>
                                )
                              )}

                              {/* Kick button */}
                              <button
                                onClick={() => handleKickMember(member._id)}
                                className="p-1 rounded bg-surface-800 hover:bg-danger-600/20 hover:text-danger-400 text-surface-400 transition-colors"
                                title="Kick Member"
                              >
                                <UserMinus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'invites' && (
            <div className="flex flex-col gap-4">
              <div className="bg-surface-900 border border-surface-800 p-4 rounded-xl flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className="text-2xs text-surface-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Link2 className="w-4 h-4 text-primary-500" />
                    <span>Invite Link URL</span>
                  </label>
                  {isAdmin && (
                    <span className="text-[10px] text-surface-500 font-semibold uppercase">
                      Code: {inviteCode || 'None'}
                    </span>
                  )}
                </div>

                {inviteCode ? (
                  <div className="flex flex-col gap-2">
                    <div className="bg-surface-950 px-3.5 py-2.5 rounded-lg border border-surface-800 text-xs text-primary-400 font-mono break-all select-all">
                      {window.location.origin}/join/{inviteCode}
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button type="button" variant="outline" size="sm" onClick={handleCopyLink} className="text-2xs px-3">
                        Copy Link
                      </Button>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-surface-500 italic">No invite code generated. Generate one below.</span>
                )}
              </div>

              {/* Expiry Selection & Regenerate Button */}
              {isAdmin && (
                <div className="flex flex-col gap-3 border-t border-surface-800 pt-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-2xs text-surface-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Key className="w-3.5 h-3.5" />
                      <span>Link Expiration duration</span>
                    </label>
                    <select
                      value={inviteExpiry}
                      onChange={(e) => setInviteExpiry(e.target.value)}
                      className="bg-surface-900 border border-surface-800 rounded-lg px-3 py-2 text-xs text-surface-200 focus:outline-none"
                    >
                      <option value="never">Never (Persistent)</option>
                      <option value="24h">24 Hours</option>
                      <option value="7d">7 Days</option>
                      <option value="30d">30 Days</option>
                    </select>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    loading={isRegenerating}
                    onClick={handleRegenerateCode}
                    leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                    className="w-full justify-center text-xs py-2"
                  >
                    Regenerate Invite Link
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Danger action triggers (leave/delete) */}
        <div className="border-t border-surface-800 pt-4 flex gap-3 shrink-0 select-none">
          <Button
            type="button"
            variant="outline"
            onClick={handleLeaveGroup}
            leftIcon={<LogOut className="w-4 h-4" />}
            className="flex-1 justify-center border-danger-500/20 text-danger-400 hover:bg-danger-950/20 py-2.5 text-xs font-bold uppercase tracking-wider"
          >
            Leave Group
          </Button>

          {isOwner && (
            <Button
              type="button"
              variant="outline"
              onClick={handleDeleteGroup}
              leftIcon={<Trash2 className="w-4 h-4" />}
              className="flex-1 justify-center border-danger-500 bg-danger-950/10 text-danger-400 hover:bg-danger-600 hover:text-white py-2.5 text-xs font-bold uppercase tracking-wider"
            >
              Delete Group
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default GroupSettingsModal;
export { GroupSettingsModal };
