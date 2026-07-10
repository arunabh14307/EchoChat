import React from 'react';

/**
 * Badge component — standard pill indicator for counts or states.
 *
 * @param {{
 *   variant?: 'primary'|'surface'|'success'|'danger'|'warning',
 *   children: React.ReactNode,
 *   className?: string
 * }} props
 */
const variants = {
  primary: 'bg-primary-500/20 text-primary-400 border border-primary-500/30',
  surface: 'bg-surface-800 text-surface-300 border border-surface-700',
  success: 'bg-success-500/20 text-success-400 border border-success-500/30',
  danger: 'bg-danger-500/20 text-danger-400 border border-danger-500/30',
  warning: 'bg-warning-500/20 text-warning-400 border border-warning-500/30',
};

const Badge = ({ variant = 'primary', children, className = '' }) => {
  return (
    <span
      className={`
        inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold select-none
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;
