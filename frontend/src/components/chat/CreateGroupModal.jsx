import React, { useState, useEffect } from 'react';
import { X, Search, Camera, Check, Users } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import userService from '@services/userService';
import groupService from '@services/groupService';
import { useChatStore } from '@store/chatStore';
import toast from 'react-hot-toast';

/**
 * CreateGroupModal — Private group creator panel.
 *
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void
 * }} props
 */
const CreateGroupModal = ({ isOpen, onClose }) => {
  const { addConversation, setActiveConversation } = useChatStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  // Members selection
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounced search logic for picking members
  useEffect(() => {
    if (!isOpen) return;

    const delay = setTimeout(async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const { data } = await userService.searchUsers(searchQuery);
        setSearchResults(data.users || []);
      } catch {
        toast.error('Error searching users');
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [searchQuery, isOpen]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const toggleSelectUser = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Group name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await groupService.createGroup({
        name: name.trim(),
        description: description.trim(),
        memberIds: selectedUserIds,
        avatar,
      });

      const group = response.group;
      addConversation(group);
      setActiveConversation(group._id);
      toast.success('Group created successfully!');
      handleClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create group';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setAvatar(null);
    setAvatarPreview('');
    setSearchQuery('');
    setSearchResults([]);
    setSelectedUserIds([]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Group" size="md">
      <form onSubmit={handleCreate} className="flex flex-col gap-4 select-none">
        {/* Avatar select area */}
        <div className="flex flex-col items-center gap-2 py-2">
          <div className="relative group w-20 h-20 rounded-full border border-surface-800 bg-surface-900 flex items-center justify-center overflow-hidden">
            {avatarPreview ? (
              <img src={avatarPreview} alt="group avatar" className="w-full h-full object-cover" />
            ) : (
              <Users className="w-8 h-8 text-surface-500" />
            )}
            <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="w-5 h-5 text-white" />
              <input type="file" onChange={handleAvatarChange} accept="image/*" className="hidden" />
            </label>
          </div>
          <span className="text-2xs text-surface-500 font-semibold">Group Icon</span>
        </div>

        {/* Input Details */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-2xs text-surface-400 font-bold uppercase tracking-wider">Group Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Project Alpha Team"
              className="bg-surface-900 border border-surface-800 rounded-xl px-4 py-2.5 text-sm text-surface-100 placeholder-surface-600 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-2xs text-surface-400 font-bold uppercase tracking-wider">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this group about?"
              rows={2}
              className="bg-surface-900 border border-surface-800 rounded-xl px-4 py-2.5 text-sm text-surface-100 placeholder-surface-600 focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none"
            />
          </div>
        </div>

        {/* Members Selection List */}
        <div className="flex flex-col gap-2.5 border-t border-surface-800 pt-3.5">
          <div className="flex justify-between items-center select-none mb-1">
            <label className="text-2xs text-surface-400 font-bold uppercase tracking-wider">
              Add Members ({selectedUserIds.length})
            </label>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-surface-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users by name..."
              className="w-full bg-surface-900 border border-surface-800 rounded-xl pl-10 pr-4 py-2 text-xs text-surface-200 placeholder-surface-600 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          {/* User Search Results List */}
          <div className="max-h-40 overflow-y-auto flex flex-col gap-1.5 scroll-hidden mt-1">
            {isSearching ? (
              <span className="text-2xs text-surface-500 text-center py-4 select-none">Searching...</span>
            ) : searchResults.length > 0 ? (
              searchResults.map((user) => {
                const isSelected = selectedUserIds.includes(user._id);
                return (
                  <div
                    key={user._id}
                    onClick={() => toggleSelectUser(user._id)}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-900 cursor-pointer border border-transparent hover:border-surface-800/60"
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
                    <div
                      className={`
                        w-4 h-4 rounded border flex items-center justify-center transition-colors
                        ${
                          isSelected
                            ? 'bg-primary-500 border-primary-500 text-white'
                            : 'border-surface-700 bg-surface-950'
                        }
                      `}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })
            ) : searchQuery.trim() ? (
              <span className="text-2xs text-surface-500 text-center py-4 select-none">No users found</span>
            ) : (
              <span className="text-2xs text-surface-600 text-center py-4 select-none">
                Type above to invite other users to join
              </span>
            )}
          </div>
        </div>

        {/* Action controls */}
        <div className="flex justify-end gap-3 border-t border-surface-800 pt-4">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            Create Group
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateGroupModal;
export { CreateGroupModal };
