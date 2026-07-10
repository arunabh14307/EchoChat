import React, { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { validateImageFile } from '@utils/validators';
import userService from '@services/userService';
import { useAuthStore } from '@store/authStore';
import Avatar from '../ui/Avatar';
import toast from 'react-hot-toast';

/**
 * AvatarUpload component — handles selecting, validating, and uploading profile avatars.
 */
const AvatarUpload = () => {
  const { user, updateUser } = useAuthStore();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    // Validate size and mime type
    const error = validateImageFile(file, 5);
    if (error) {
      toast.error(error);
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading('Uploading avatar...');

    try {
      const response = await userService.uploadAvatar(file);
      updateUser(response.data.user);
      toast.success('Avatar updated successfully!', { id: toastId });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to upload avatar';
      toast.error(msg, { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerSelect = () => {
    if (!isUploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="relative group select-none">
      <Avatar
        src={user?.avatar?.url}
        username={user?.username}
        size="xl"
        className="w-24 h-24 border-4 border-surface-900 shadow-lg"
      />

      <button
        type="button"
        onClick={triggerSelect}
        disabled={isUploading}
        className={`
          absolute inset-0 rounded-full flex items-center justify-center
          bg-surface-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200
          border-4 border-transparent cursor-pointer
          ${isUploading ? 'opacity-100 cursor-not-allowed' : ''}
        `}
      >
        {isUploading ? (
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        ) : (
          <Camera className="w-6 h-6 text-white" />
        )}
      </button>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
      />
    </div>
  );
};

export default AvatarUpload;
