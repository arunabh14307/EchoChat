import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User as UserIcon, Calendar, Lock, Globe, Shield, Activity } from 'lucide-react';
import { useAuthStore } from '@store/authStore';
import userService from '@services/userService';
import Button from '@components/ui/Button';
import AvatarUpload from '@components/profile/AvatarUpload';
import CoverUpload from '@components/profile/CoverUpload';
import EditProfileModal from '@components/profile/EditProfileModal';
import ProfileSkeleton from '@components/profile/ProfileSkeleton';
import { formatLastSeen } from '@utils/formatTime';
import toast from 'react-hot-toast';

/**
 * ProfilePage — renders the full detailed profile page of the current logged-in user.
 */
const ProfilePage = () => {
  const { user, updateUser } = useAuthStore();
  const navigate = useNavigate();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Sync profile details on mount from the server
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await userService.getMe();
        updateUser(response.data.user);
      } catch (err) {
        toast.error('Failed to sync profile from server');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [updateUser]);

  if (isLoading && !user) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4">
        <ProfileSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col p-4 md:p-8 relative overflow-hidden select-text">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />

      {/* Main card box */}
      <div className="w-full max-w-2xl bg-surface-900 border border-surface-800 rounded-2xl overflow-hidden shadow-glow-sm m-auto relative z-10 animate-fade-up">
        {/* Cover Photo */}
        <CoverUpload />

        {/* Profile Content container */}
        <div className="px-6 pb-8 md:px-8 md:pb-8 relative flex flex-col gap-6">
          {/* Avatar overlay and Edit Button Row */}
          <div className="flex justify-between items-end -mt-12 mb-2 shrink-0">
            <AvatarUpload />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              className="h-10 px-4"
            >
              Edit Profile
            </Button>
          </div>

          {/* Names block */}
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-surface-50">
              {user?.displayName || user?.username}
            </h1>
            <span className="text-sm text-surface-400">@{user?.username}</span>
          </div>

          {/* Bio block */}
          {user?.bio ? (
            <p className="text-sm text-surface-200 bg-surface-850 p-4 rounded-xl border border-surface-800 leading-relaxed">
              {user.bio}
            </p>
          ) : (
            <p className="text-sm text-surface-500 italic">No bio provided yet.</p>
          )}

          <hr className="border-surface-800" />

          {/* Detail parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm py-2">
            {/* Email */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-surface-500 tracking-wider uppercase">
                Email Address
              </span>
              <span className="text-surface-100 font-medium">{user?.email}</span>
            </div>

            {/* Birthday */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-surface-500 tracking-wider uppercase">
                Date of Birth
              </span>
              <span className="text-surface-100 font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4 text-surface-400" />
                <span>
                  {user?.dateOfBirth
                    ? new Date(user.dateOfBirth).toLocaleDateString(undefined, {
                        dateStyle: 'long',
                      })
                    : 'Not specified'}
                </span>
              </span>
            </div>

            {/* Gender */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-surface-500 tracking-wider uppercase">
                Gender
              </span>
              <span className="text-surface-100 font-medium capitalize flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-surface-400" />
                <span>{user?.gender ? user.gender.replace(/_/g, ' ') : 'Not specified'}</span>
              </span>
            </div>

            {/* Profile privacy settings */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-surface-500 tracking-wider uppercase">
                Profile Visibility
              </span>
              <span className="text-surface-100 font-medium flex items-center gap-2">
                {user?.privacy === 'private' ? (
                  <>
                    <Lock className="w-4 h-4 text-warning-500" />
                    <span className="text-warning-500">Private Profile</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4 text-success-500" />
                    <span className="text-success-500">Public Profile</span>
                  </>
                )}
              </span>
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-surface-500 tracking-wider uppercase">
                Status
              </span>
              <span className="text-surface-100 font-medium flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    user?.status === 'online' ? 'bg-success-500' : 'bg-surface-600'
                  }`}
                />
                <span className="capitalize">{user?.status}</span>
              </span>
            </div>

            {/* Last presence */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-surface-500 tracking-wider uppercase">
                Last Activity
              </span>
              <span className="text-surface-100 font-medium flex items-center gap-2">
                <Activity className="w-4 h-4 text-surface-400" />
                <span>
                  {user?.status === 'online' ? 'Active Now' : formatLastSeen(user?.lastSeen)}
                </span>
              </span>
            </div>
          </div>

          <hr className="border-surface-800" />

          {/* Footer Back navigation */}
          <div className="flex justify-between items-center mt-2 shrink-0 select-none">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back to Chats
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Profile overlay Modal */}
      <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
    </div>
  );
};

export default ProfilePage;
export { ProfilePage };
