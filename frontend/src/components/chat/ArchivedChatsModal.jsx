import React, { useState, useEffect } from 'react';
import { Archive, Loader2, VolumeX, ArchiveRestore } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import chatService from '@services/chatService';
import { useAuthStore } from '@store/authStore';
import { useChatStore } from '@store/chatStore';
import toast from 'react-hot-toast';
import api from '@services/api';

/**
 * ArchivedChatsModal component — displays a list of archived conversations for the current user,
 * and allows unarchiving them.
 *
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   onRefreshActive: () => void
 * }} props
 */
const ArchivedChatsModal = ({ isOpen, onClose, onRefreshActive }) => {
  const [archivedList, setArchivedList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user: currentUser } = useAuthStore();
  const { addConversation } = useChatStore();

  const fetchArchived = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/conversations?archived=true');
      setArchivedList(response.data.data.conversations || []);
    } catch {
      toast.error('Failed to load archived conversations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchArchived();
    }
  }, [isOpen]);

  const handleUnarchive = async (e, conversationId) => {
    e.stopPropagation();
    const toastId = toast.loading('Unarchiving chat...');
    try {
      const response = await chatService.archiveConversation(conversationId, false);
      const conversation = response.data.conversation;
      setArchivedList((prev) => prev.filter((c) => c._id !== conversationId));

      // Push back to active lists
      addConversation(conversation);
      toast.success('Chat unarchived!', { id: toastId });
      onRefreshActive();
    } catch {
      toast.error('Failed to unarchive conversation', { id: toastId });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Archived Chats">
      <div className="flex flex-col gap-4 min-h-36 max-h-[60vh] select-none">
        {isLoading ? (
          <div className="flex-center py-12 text-primary-500">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : archivedList.length > 0 ? (
          <div className="flex flex-col gap-2 overflow-y-auto scroll-hidden pr-0.5">
            {archivedList.map((c) => {
              const isGroup = c.type === 'group';
              const partner = isGroup
                ? null
                : c.participants.find((p) => p._id !== currentUser?._id);

              const displayName = isGroup ? c.name : partner?.displayName || partner?.username || 'User';
              const avatarUrl = isGroup ? c.groupAvatar?.url : partner?.avatar?.url;
              const isMuted = c.mutedBy?.includes(currentUser?._id);

              return (
                <div
                  key={c._id}
                  className="flex items-center justify-between p-3.5 bg-surface-900/60 border border-surface-800/40 rounded-xl"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar src={avatarUrl} username={displayName} size="sm" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-surface-50 truncate leading-tight">
                        {displayName}
                      </span>
                      {isGroup ? (
                        <span className="text-2xs text-surface-500 mt-0.5">Group chat</span>
                      ) : (
                        <span className="text-2xs text-surface-500 mt-0.5">@{partner?.username}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isMuted && <VolumeX className="w-3.5 h-3.5 text-surface-500 mr-1" />}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleUnarchive(e, c._id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-surface-800 hover:border-surface-700 text-xs font-semibold text-surface-300 hover:text-surface-100"
                    >
                      <ArchiveRestore className="w-4 h-4" />
                      <span>Unarchive</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center text-surface-500 gap-2">
            <Archive className="w-8 h-8 opacity-45" />
            <p className="text-sm">No archived chats</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ArchivedChatsModal;
export { ArchivedChatsModal };
