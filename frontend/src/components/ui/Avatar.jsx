import React from 'react';
import { DEFAULT_AVATAR_URL } from '@utils/constants';

/**
 * Avatar component — displays user avatar with online/offline indicators and size variations.
 *
 * @param {{
 *   src?: string,
 *   username?: string,
 *   size?: 'xs'|'sm'|'md'|'lg'|'xl',
 *   status?: 'online'|'offline'|'away'|null,
 *   className?: string,
 *   [key: string]: any
 * }} props
 */
const sizeMap = {
  xs: 'w-6 h-6 text-2xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

const statusSizeMap = {
  xs: 'w-2 h-2',
  sm: 'w-2.5 h-2.5',
  md: 'w-3 h-3',
  lg: 'w-3.5 h-3.5',
  xl: 'w-4.5 h-4.5',
};

const statusColorMap = {
  online: 'bg-success-500',
  offline: 'bg-surface-600',
  away: 'bg-warning-500',
};

const Avatar = ({
  src,
  username = '?',
  size = 'md',
  status = null,
  className = '',
  ...rest
}) => {
  const fallbackUrl = `${DEFAULT_AVATAR_URL}?seed=${encodeURIComponent(username)}`;
  const avatarSrc = src || fallbackUrl;

  return (
    <div className={`relative shrink-0 select-none ${className}`} {...rest}>
      <img
        src={avatarSrc}
        alt={username}
        className={`rounded-full object-cover bg-surface-800 ${sizeMap[size]}`}
        onError={(e) => {
          e.target.src = fallbackUrl;
        }}
      />
      {status && (
        <span
          className={`
            absolute bottom-0 right-0 rounded-full border-2 border-surface-950
            ${statusSizeMap[size]}
            ${statusColorMap[status]}
          `}
        />
      )}
    </div>
  );
};

export default Avatar;
