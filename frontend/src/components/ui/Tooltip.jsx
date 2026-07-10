import React, { useState } from 'react';

/**
 * Tooltip component — displays a text label on hover.
 *
 * @param {{
 *   content: string,
 *   position?: 'top'|'bottom'|'left'|'right',
 *   children: React.ReactNode,
 *   className?: string
 * }} props
 */
const positions = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

const Tooltip = ({
  content,
  position = 'top',
  children,
  className = '',
}) => {
  const [show, setShow] = useState(false);

  return (
    <div
      className="relative flex items-center justify-center"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div
          className={`
            absolute z-50 px-2 py-1 text-xs text-surface-100 bg-surface-800 border border-surface-700
            rounded-md shadow-lg whitespace-nowrap pointer-events-none animate-fade-in
            ${positions[position]}
            ${className}
          `}
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
