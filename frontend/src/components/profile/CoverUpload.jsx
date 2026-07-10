import React, { useRef, useState } from 'react';
import { Image as ImageIcon, Loader2 } from 'lucide-react';
import { validateImageFile } from '@utils/validators';
import userService from '@services/userService';
import { useAuthStore } from '@store/authStore';
import toast from 'react-hot-toast';

/**
 * CoverUpload component — manages selecting, validating, and uploading profile cover photos.
 */
const CoverUpload = () => {
  const { user, updateUser } = useAuthStore();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    const error = validateImageFile(file, 5);
    if (error) {
      toast.error(error);
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading('Uploading cover photo...');

    try {
      const response = await userService.uploadCoverPhoto(file);
      updateUser(response.data.user);
      toast.success('Cover photo updated successfully!', { id: toastId });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to upload cover photo';
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

  const coverUrl = user?.coverPhoto?.url;

  return (
    <div className="relative w-full h-44 bg-surface-800 rounded-t-2xl overflow-hidden group select-none">
      {coverUrl ? (
        <img
          src={coverUrl}
          alt="Cover"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-r from-surface-800 to-surface-850 flex items-center justify-center text-surface-600">
          <ImageIcon className="w-10 h-10" />
        </div>
      )}

      {/* Overlay controls */}
      <button
        type="button"
        onClick={triggerSelect}
        disabled={isUploading}
        className={`
          absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg
          bg-surface-950/70 hover:bg-surface-950 text-xs font-medium text-surface-200 hover:text-white
          transition-all backdrop-blur-xs cursor-pointer border border-surface-800
          ${isUploading ? 'opacity-100 cursor-not-allowed' : 'opacity-0 group-hover:opacity-100'}
        `}
      >
        {isUploading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Uploading...</span>
          </>
        ) : (
          <>
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Change Cover</span>
          </>
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

export default CoverUpload;
