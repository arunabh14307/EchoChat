import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@store/authStore';
import { ArrowLeft, Bell, Volume2, Monitor, EyeOff, MessageSquare, Users, ShieldAlert } from 'lucide-react';
import Button from '@components/ui/Button';
import userService from '@services/userService';
import toast from 'react-hot-toast';

const NotificationSettings = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();

  const currentSettings = user?.notificationSettings || {
    enableSound: true,
    enableBrowser: true,
    doNotDisturb: false,
    muteGroups: false,
    muteDirect: false,
  };

  const [settings, setSettings] = useState(currentSettings);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await userService.updateProfile({
        notificationSettings: settings,
      });
      // Response.data contains the updated user
      updateUser({ notificationSettings: response.data.notificationSettings });
      toast.success('Notification preferences updated successfully');
      navigate('/');
    } catch {
      toast.error('Failed to update notification settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-surface-900 border border-surface-800 rounded-2xl shadow-2xl p-6 flex flex-col gap-6 animate-fade-in select-none">
        
        {/* Top Navbar */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="p-2 rounded-xl text-surface-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex flex-col">
            <h2 className="text-lg font-bold text-surface-50">Notification Preferences</h2>
            <span className="text-xs text-surface-400">Configure alert rules and sound settings</span>
          </div>
        </div>

        {/* Form Container */}
        <div className="flex flex-col gap-4">
          
          {/* General Toggles */}
          <div className="flex flex-col gap-3.5 bg-surface-950/40 border border-surface-850 p-4.5 rounded-xl">
            <h3 className="text-2xs font-extrabold text-surface-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5" />
              General Controls
            </h3>

            {/* DND Toggle */}
            <div className="flex items-center justify-between py-1">
              <div className="flex flex-col pr-4">
                <span className="text-sm font-semibold text-surface-100 flex items-center gap-2">
                  Do Not Disturb
                </span>
                <span className="text-xs text-surface-500 mt-0.5">
                  Mute all notification sounds, banners, and logs completely.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.doNotDisturb}
                onChange={() => handleToggle('doNotDisturb')}
                className="w-9 h-5 bg-surface-800 checked:bg-primary-500 rounded-full cursor-pointer appearance-none relative transition-colors duration-200 before:absolute before:h-4 before:w-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-4 before:transition-transform before:duration-200"
              />
            </div>

            {/* Sound Toggle */}
            <div className="flex items-center justify-between py-1 opacity-90">
              <div className="flex flex-col pr-4">
                <span className="text-sm font-semibold text-surface-100 flex items-center gap-2">
                  Sound Effects
                </span>
                <span className="text-xs text-surface-500 mt-0.5">
                  Play standard audio notification sound when a message arrives.
                </span>
              </div>
              <input
                type="checkbox"
                disabled={settings.doNotDisturb}
                checked={!settings.doNotDisturb && settings.enableSound}
                onChange={() => handleToggle('enableSound')}
                className="w-9 h-5 bg-surface-800 checked:bg-primary-500 disabled:opacity-50 rounded-full cursor-pointer appearance-none relative transition-colors duration-200 before:absolute before:h-4 before:w-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-4 before:transition-transform before:duration-200"
              />
            </div>

            {/* Browser Popup Toggle */}
            <div className="flex items-center justify-between py-1 opacity-90">
              <div className="flex flex-col pr-4">
                <span className="text-sm font-semibold text-surface-100 flex items-center gap-2">
                  Browser Banner Popups
                </span>
                <span className="text-xs text-surface-500 mt-0.5">
                  Show notification banner when EchoChat window is backgrounded.
                </span>
              </div>
              <input
                type="checkbox"
                disabled={settings.doNotDisturb}
                checked={!settings.doNotDisturb && settings.enableBrowser}
                onChange={() => handleToggle('enableBrowser')}
                className="w-9 h-5 bg-surface-800 checked:bg-primary-500 disabled:opacity-50 rounded-full cursor-pointer appearance-none relative transition-colors duration-200 before:absolute before:h-4 before:w-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-4 before:transition-transform before:duration-200"
              />
            </div>
          </div>

          {/* Filtering Toggles */}
          <div className="flex flex-col gap-3.5 bg-surface-950/40 border border-surface-850 p-4.5 rounded-xl">
            <h3 className="text-2xs font-extrabold text-surface-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              Chat Specific Mutes
            </h3>

            {/* Mute Direct Chats */}
            <div className="flex items-center justify-between py-1">
              <div className="flex flex-col pr-4">
                <span className="text-sm font-semibold text-surface-100">
                  Mute Direct Messages
                </span>
                <span className="text-xs text-surface-500 mt-0.5">
                  Disable notifications for 1-to-1 conversations.
                </span>
              </div>
              <input
                type="checkbox"
                disabled={settings.doNotDisturb}
                checked={!settings.doNotDisturb && settings.muteDirect}
                onChange={() => handleToggle('muteDirect')}
                className="w-9 h-5 bg-surface-800 checked:bg-primary-500 disabled:opacity-50 rounded-full cursor-pointer appearance-none relative transition-colors duration-200 before:absolute before:h-4 before:w-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-4 before:transition-transform before:duration-200"
              />
            </div>

            {/* Mute Groups */}
            <div className="flex items-center justify-between py-1">
              <div className="flex flex-col pr-4">
                <span className="text-sm font-semibold text-surface-100">
                  Mute Group Notifications
                </span>
                <span className="text-xs text-surface-500 mt-0.5">
                  Disable notifications for group conversations.
                </span>
              </div>
              <input
                type="checkbox"
                disabled={settings.doNotDisturb}
                checked={!settings.doNotDisturb && settings.muteGroups}
                onChange={() => handleToggle('muteGroups')}
                className="w-9 h-5 bg-surface-800 checked:bg-primary-500 disabled:opacity-50 rounded-full cursor-pointer appearance-none relative transition-colors duration-200 before:absolute before:h-4 before:w-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-4 before:transition-transform before:duration-200"
              />
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-3 mt-2">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="px-5 text-surface-400 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            loading={isSaving}
            className="px-6"
          >
            Save Changes
          </Button>
        </div>

      </div>
    </div>
  );
};

export default NotificationSettings;
export { NotificationSettings };
