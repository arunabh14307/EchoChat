import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LogOut, MessageSquare, Archive, Bell, Settings, MoreVertical, Users, Link as LinkIcon, Plus } from 'lucide-react';
import { useAuth } from '@hooks/useAuth';
import { useChatStore } from '@store/chatStore';
import { useNotificationStore } from '@store/notificationStore';
import { useConversations } from '@hooks/useConversations';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Dropdown from '../ui/Dropdown';
import UserSearch from '../profile/UserSearch';
import ChatList from '../chat/ChatList';
import ArchivedChatsModal from '../chat/ArchivedChatsModal';
import CreateGroupModal from '../chat/CreateGroupModal';
import NotificationDrawer from '../chat/NotificationDrawer';
import groupService from '@services/groupService';
import toast from 'react-hot-toast';

/**
 * Sidebar component — manages Search, Group creation, Join with link, Notification bell drawer, and options dropdowns.
 */
const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Dialog & Drawer toggles
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isJoinLinkOpen, setIsJoinLinkOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // States
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState('');

  const { setActiveConversation, addConversation } = useChatStore();
  const { unreadCount } = useNotificationStore();
  const { refetch: refetchActive } = useConversations();

  const handleSelectChat = (conversationId) => {
    setActiveConversation(conversationId);
  };

  const handleJoinByCode = async (e) => {
    e.preventDefault();
    if (!inviteCodeInput.trim()) return;

    setIsJoining(true);
    try {
      // Parse invite code from full link URL if pasted
      let finalCode = inviteCodeInput.trim();
      if (finalCode.includes('/join/')) {
        finalCode = finalCode.split('/join/').pop();
      }

      const response = await groupService.joinGroupWithInvite(finalCode);
      const group = response.data.group;
      
      addConversation(group);
      setActiveConversation(group._id);
      
      toast.success(`Joined group "${group.name}" successfully!`);
      setInviteCodeInput('');
      setIsJoinLinkOpen(false);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to join group. Code may be invalid or expired.';
      toast.error(msg);
    } finally {
      setIsJoining(false);
    }
  };

  // Dropdown list items
  const menuItems = [
    {
      label: 'Notification Settings',
      icon: <Settings className="w-4 h-4" />,
      onClick: () => navigate('/settings/notifications'),
    },
    {
      label: 'Archived Chats',
      icon: <Archive className="w-4 h-4" />,
      onClick: () => setIsArchiveOpen(true),
    },
    {
      label: 'Log Out',
      icon: <LogOut className="w-4 h-4" />,
      onClick: logout,
      variant: 'danger',
    },
  ];

  return (
    <div className="w-80 bg-surface-900 border-r border-surface-800 flex flex-col h-full shrink-0 select-none">
      {/* Sidebar Header: Current User details */}
      <div className="p-4 border-b border-surface-800 flex items-center justify-between bg-surface-900/40 backdrop-blur-md">
        <div
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2.5 cursor-pointer group flex-1 mr-2 min-w-0"
        >
          <Avatar
            src={user?.avatar?.url}
            username={user?.username}
            status="online"
            size="sm"
            className="group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-surface-50 leading-tight group-hover:text-primary-400 transition-colors truncate">
              {user?.displayName || user?.username}
            </span>
            <span className="text-2xs text-surface-500 truncate">@{user?.username}</span>
          </div>
        </div>

        {/* Header Action controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="p-2 rounded-lg"
            onClick={() => setIsSearchOpen(true)}
            title="Search Users"
          >
            <Search className="w-4.5 h-4.5 text-surface-400" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="p-2 rounded-lg"
            onClick={() => setIsCreateGroupOpen(true)}
            title="Create Group"
          >
            <Users className="w-4.5 h-4.5 text-surface-400" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="p-2 rounded-lg"
            onClick={() => setIsJoinLinkOpen(true)}
            title="Join group with code"
          >
            <LinkIcon className="w-4.5 h-4.5 text-surface-400" />
          </Button>

          {/* Notification Bell with Red Dot */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className={`p-2 rounded-lg ${isNotificationOpen ? 'bg-surface-800 text-primary-400' : ''}`}
              onClick={() => setIsNotificationOpen(true)}
              title="Notifications Drawer"
            >
              <Bell className="w-4.5 h-4.5 text-surface-400" />
            </Button>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary-500 ring-2 ring-surface-900 pointer-events-none animate-pulse" />
            )}
          </div>

          <Dropdown
            trigger={
              <Button
                variant="ghost"
                size="sm"
                className="p-2 rounded-lg"
                title="Options"
              >
                <MoreVertical className="w-4.5 h-4.5 text-surface-400" />
              </Button>
            }
            items={menuItems}
            position="bottom-right"
          />
        </div>
      </div>

      {/* Conversations List content */}
      <div className="flex-1 flex flex-col min-h-0 bg-surface-950/20 py-2">
        {/* Search filter input */}
        <div className="px-4 py-1.5 shrink-0 select-none">
          <div className="relative">
            <Search className="w-4 h-4 text-surface-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              placeholder="Search chats or groups..."
              className="w-full bg-surface-900/60 border border-surface-800 rounded-xl pl-9 pr-3 py-2 text-xs text-surface-200 placeholder-surface-600 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="flex justify-between items-center px-4 py-2 text-2xs font-bold text-surface-500 uppercase tracking-wider shrink-0 select-none">
          <span>Recent Chats</span>
          <MessageSquare className="w-3.5 h-3.5" />
        </div>

        <div className="flex-1 overflow-y-auto scroll-hidden flex flex-col">
          <ChatList onSelectChat={handleSelectChat} searchQuery={localSearchQuery} />
        </div>
      </div>

      {/* Interactive Search Modal */}
      <Modal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        title="Find people on EchoChat"
      >
        <UserSearch onStartChat={() => setIsSearchOpen(false)} />
      </Modal>

      {/* Archived Conversations Modal */}
      <ArchivedChatsModal
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        onRefreshActive={refetchActive}
      />

      {/* Group Creation Modal */}
      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
      />

      {/* Join Group with Code Modal */}
      <Modal
        isOpen={isJoinLinkOpen}
        onClose={() => setIsJoinLinkOpen(false)}
        title="Join Group via Invite"
        size="sm"
      >
        <form onSubmit={handleJoinByCode} className="flex flex-col gap-4 select-none">
          <div className="flex flex-col gap-1">
            <label className="text-2xs text-surface-400 font-bold uppercase tracking-wider">
              Invite Link or Code
            </label>
            <input
              type="text"
              required
              value={inviteCodeInput}
              onChange={(e) => setInviteCodeInput(e.target.value)}
              placeholder="e.g. 7f3b89ce or full URL"
              className="bg-surface-900 border border-surface-800 rounded-xl px-4 py-2.5 text-sm text-surface-100 placeholder-surface-600 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsJoinLinkOpen(false)} disabled={isJoining}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isJoining}>
              Join Group
            </Button>
          </div>
        </form>
      </Modal>

      {/* Notification Drawer Overlay */}
      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
    </div>
  );
};

export default Sidebar;
export { Sidebar };
