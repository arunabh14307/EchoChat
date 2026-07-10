import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useAuthStore } from '@store/authStore';
import userService from '@services/userService';
import toast from 'react-hot-toast';

/**
 * EditProfileModal component — lets users update display name, bio, gender, DOB, and privacy.
 *
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void
 * }} props
 */
const EditProfileModal = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuthStore();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [privacy, setPrivacy] = useState('public');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || user.username);
      setBio(user.bio || '');
      setGender(user.gender || '');
      setPrivacy(user.privacy || 'public');

      if (user.dateOfBirth) {
        try {
          const dateStr = new Date(user.dateOfBirth).toISOString().split('T')[0];
          setDateOfBirth(dateStr);
        } catch {
          setDateOfBirth('');
        }
      } else {
        setDateOfBirth('');
      }
    }
  }, [user, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};
    if (!displayName || !displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    } else if (displayName.length > 50) {
      newErrors.displayName = 'Display name must be under 50 characters';
    }

    if (bio.length > 200) {
      newErrors.bio = 'Bio must be under 200 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Saving updates...');

    try {
      const response = await userService.updateProfile({
        displayName: displayName.trim(),
        bio: bio.trim(),
        gender,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString() : null,
        privacy,
      });

      updateUser(response.data.user);
      toast.success('Profile updated successfully!', { id: toastId });
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile';
      toast.error(msg, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Profile"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="edit-profile-form" isLoading={isSubmitting}>
            Save Changes
          </Button>
        </>
      }
    >
      <form id="edit-profile-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Display Name */}
        <Input
          label="Display Name"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          error={errors.displayName}
          disabled={isSubmitting}
        />

        {/* Bio */}
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-sm font-medium text-surface-300">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            disabled={isSubmitting}
            rows={3}
            placeholder="Tell us about yourself..."
            className={`
              w-full bg-surface-800 border rounded-xl px-4 py-2.5
              text-surface-100 placeholder-surface-500 text-sm resize-none
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
              transition-all duration-200
              ${errors.bio ? 'border-danger-500' : 'border-surface-700 hover:border-surface-650'}
            `}
          />
          {errors.bio && <span className="text-xs text-danger-500">{errors.bio}</span>}
        </div>

        {/* Gender & DOB row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Gender */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-medium text-surface-300">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              disabled={isSubmitting}
              className="w-full bg-surface-800 border border-surface-700 rounded-xl px-4 py-2.5 text-surface-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </div>

          {/* Date of Birth */}
          <Input
            label="Date of Birth"
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        {/* Profile Privacy */}
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-sm font-medium text-surface-300">Profile Privacy</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPrivacy('public')}
              className={`
                px-4 py-2.5 rounded-xl border text-sm font-medium transition-all select-none
                ${
                  privacy === 'public'
                    ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                    : 'border-surface-700 bg-surface-800 text-surface-300 hover:border-surface-600'
                }
              `}
            >
              Public
            </button>
            <button
              type="button"
              onClick={() => setPrivacy('private')}
              className={`
                px-4 py-2.5 rounded-xl border text-sm font-medium transition-all select-none
                ${
                  privacy === 'private'
                    ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                    : 'border-surface-700 bg-surface-800 text-surface-300 hover:border-surface-600'
                }
              `}
            >
              Private
            </button>
          </div>
          <p className="text-2xs text-surface-500 mt-0.5">
            Private profiles restrict views of personal info to external searches.
          </p>
        </div>
      </form>
    </Modal>
  );
};

export default EditProfileModal;
export { EditProfileModal };
