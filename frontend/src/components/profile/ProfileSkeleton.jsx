import React from 'react';

/**
 * ProfileSkeleton component — loading placeholder matching ProfilePage layout.
 */
const ProfileSkeleton = () => {
  return (
    <div className="w-full max-w-2xl bg-surface-900 border border-surface-800 rounded-2xl overflow-hidden shadow-glow-sm">
      {/* Cover Skeleton */}
      <div className="w-full h-44 bg-surface-800 animate-pulse" />

      {/* Profile Details Skeleton */}
      <div className="px-8 pb-8 relative flex flex-col gap-6">
        {/* Avatar block */}
        <div className="flex justify-between items-end -mt-12 mb-2">
          <div className="w-24 h-24 rounded-full border-4 border-surface-900 bg-surface-850 animate-pulse" />
          <div className="w-28 h-10 rounded-xl bg-surface-800 animate-pulse" />
        </div>

        {/* Info Rows */}
        <div className="flex flex-col gap-4">
          {/* Names */}
          <div className="flex flex-col gap-2">
            <div className="h-6 w-48 bg-surface-800 rounded animate-pulse" />
            <div className="h-4 w-32 bg-surface-850 rounded animate-pulse" />
          </div>

          {/* Bio */}
          <div className="flex flex-col gap-2.5 mt-2">
            <div className="h-4 w-full bg-surface-850 rounded animate-pulse" />
            <div className="h-4 w-[90%] bg-surface-850 rounded animate-pulse" />
          </div>

          <hr className="border-surface-800 mt-2" />

          {/* Meta Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 py-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <div className="h-3 w-20 bg-surface-800 rounded animate-pulse" />
                <div className="h-4.5 w-36 bg-surface-850 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;
