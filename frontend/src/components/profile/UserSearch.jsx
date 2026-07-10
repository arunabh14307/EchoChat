import React, { useState, useEffect } from 'react';
import { Search, SearchX, ShieldAlert, Loader2, MessageSquare } from 'lucide-react';
import { useDebounce } from '@hooks/useDebounce';
import userService from '@services/userService';
import chatService from '@services/chatService';
import { useChatStore } from '@store/chatStore';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import toast from 'react-hot-toast';
import { formatLastSeen } from '@utils/formatTime';

/**
 * UserSearch component — handles real-time debounced user search with status indicators,
 * and allows starting or selecting existing direct chat conversations.
 *
 * @param {{
 *   onStartChat?: (conversationId: string) => void
 * }} props
 */
const UserSearch = ({ onStartChat }) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 400);

  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Profile Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);

  const { addConversation, setActiveConversation } = useChatStore();

  useEffect(() => {
    const triggerSearch = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        setIsLoading(false);
        setHasSearched(false);
        return;
      }

      setIsLoading(true);
      setHasSearched(true);

      try {
        const response = await userService.searchUsers(debouncedQuery);
        setResults(response.data.users);
      } catch (err) {
        toast.error('Failed to search users. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    triggerSearch();
  }, [debouncedQuery]);

  const handleViewProfile = async (userId) => {
    setIsLoadingProfile(true);
    try {
      const response = await userService.getUserById(userId);
      setSelectedUser(response.data.user);
      setIsModalOpen(true);
    } catch (err) {
      toast.error('Failed to load user profile');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleStartChat = async (e, recipientId) => {
    e.stopPropagation();
    setIsStartingChat(true);
    const toastId = toast.loading('Initializing conversation...');

    try {
      const response = await chatService.createOrGetConversation(recipientId);
      const conversation = response.data.conversation;
      addConversation(conversation);
      setActiveConversation(conversation._id);
      setIsModalOpen(false);
      toast.success('Chat loaded!', { id: toastId });
      if (onStartChat) {
        onStartChat(conversation._id);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to start conversation';
      toast.error(msg, { id: toastId });
    } finally {
      setIsStartingChat(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 select-none">
      {/* Search Input bar */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by username or display name..."
          className="w-full bg-surface-800 border border-surface-700 rounded-xl pl-11 pr-4 py-2.5 text-surface-100 placeholder-surface-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
        />
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-500 flex items-center justify-center">
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </div>
      </div>

      {/* Results Box */}
      <div className="flex flex-col gap-2 min-h-24">
        {isLoading && results.length === 0 ? (
          // Loading Skeletons
          <div className="flex flex-col gap-2.5 animate-fade-in">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-surface-900/40 border border-surface-800/40 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-surface-800 animate-pulse" />
                <div className="flex flex-col gap-1.5 flex-1">
                  <div className="h-4 w-28 bg-surface-800 rounded animate-pulse" />
                  <div className="h-3.5 w-16 bg-surface-850 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="flex flex-col gap-2 animate-fade-in">
            {results.map((u) => (
              <div
                key={u._id}
                onClick={() => handleViewProfile(u._id)}
                className="flex items-center justify-between p-3 bg-surface-900/60 hover:bg-surface-800/50 border border-surface-800/40 hover:border-surface-700/60 rounded-xl cursor-pointer transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <Avatar src={u.avatar?.url} username={u.username} status={u.status} size="md" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-surface-50 leading-tight">
                      {u.displayName || u.username}
                    </span>
                    <span className="text-xs text-surface-400">@{u.username}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 rounded-lg"
                    onClick={(e) => handleStartChat(e, u._id)}
                    disabled={isStartingChat}
                    title="Send Message"
                  >
                    <MessageSquare className="w-4.5 h-4.5 text-primary-450" />
                  </Button>
                  <Button variant="ghost" size="sm" className="px-3">
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : hasSearched ? (
          // No Results State
          <div className="flex flex-col items-center justify-center py-6 text-center gap-2 text-surface-500 animate-fade-in">
            <SearchX className="w-8 h-8 opacity-60" />
            <span className="text-sm font-medium">No users found</span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center text-surface-500 text-xs">
            Start typing to search users
          </div>
        )}
      </div>

      {/* User Profile Info Modal */}
      {selectedUser && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="User Profile"
          footer={
            <Button
              variant="primary"
              onClick={(e) => handleStartChat(e, selectedUser._id)}
              isLoading={isStartingChat}
              leftIcon={<MessageSquare className="w-4 h-4" />}
            >
              Start Chat
            </Button>
          }
        >
          <div className="flex flex-col gap-5 relative select-text">
            {/* Cover and header block */}
            <div className="relative w-full h-28 bg-surface-800 rounded-xl overflow-hidden mb-8">
              {selectedUser.coverPhoto?.url && (
                <img
                  src={selectedUser.coverPhoto.url}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute -bottom-8 left-6">
                <Avatar
                  src={selectedUser.avatar?.url}
                  username={selectedUser.username}
                  size="lg"
                  status={selectedUser.status}
                  className="w-16 h-16 border-4 border-surface-900"
                />
              </div>
            </div>

            {/* Names & User Status */}
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-bold text-surface-50 flex items-center gap-2">
                <span>{selectedUser.displayName || selectedUser.username}</span>
                {selectedUser.privacy === 'private' && (
                  <ShieldAlert className="w-4 h-4 text-warning-500" />
                )}
              </h2>
              <span className="text-xs text-surface-400">@{selectedUser.username}</span>
            </div>

            {/* Content detail / Privacy constraint checks */}
            {selectedUser.isRestricted ? (
              <div className="flex flex-col items-center justify-center p-6 bg-surface-950/40 rounded-xl border border-surface-800 text-center gap-2">
                <ShieldAlert className="w-7 h-7 text-warning-500" />
                <span className="text-sm font-semibold text-surface-300">
                  This profile is private
                </span>
                <p className="text-xs text-surface-500">
                  Detailed information has been hidden.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {selectedUser.bio && (
                  <div className="text-sm text-surface-300 bg-surface-850 p-3.5 rounded-xl border border-surface-800">
                    {selectedUser.bio}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-xs mt-2 border-t border-surface-800 pt-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-surface-500">Gender</span>
                    <span className="text-surface-200 capitalize font-medium">
                      {selectedUser.gender ? selectedUser.gender.replace(/_/g, ' ') : 'Not specified'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-surface-500">Birthday</span>
                    <span className="text-surface-200 font-medium">
                      {selectedUser.dateOfBirth
                        ? new Date(selectedUser.dateOfBirth).toLocaleDateString(undefined, {
                            dateStyle: 'medium',
                          })
                        : 'Not specified'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-surface-500">Status</span>
                    <span className="text-surface-200 font-medium flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          selectedUser.status === 'online' ? 'bg-success-500' : 'bg-surface-600'
                        }`}
                      />
                      <span className="capitalize">{selectedUser.status}</span>
                    </span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-surface-500">Presence</span>
                    <span className="text-surface-200 font-medium">
                      {selectedUser.status === 'online'
                        ? 'Online'
                        : formatLastSeen(selectedUser.lastSeen)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default UserSearch;
export { UserSearch };
