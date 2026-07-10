import React, { useState, useEffect, useRef } from 'react';

/**
 * Dropdown component — reusable menu list triggered by clicking.
 *
 * @param {{
 *   trigger: React.ReactNode,
 *   items: Array<{
 *     label: string,
 *     icon?: React.ReactNode,
 *     onClick: () => void,
 *     variant?: 'default'|'danger'
 *   }>,
 *   position?: 'bottom-left'|'bottom-right'|'top-left'|'top-right',
 *   className?: string
 * }} props
 */
const positions = {
  'bottom-left': 'top-full left-0 mt-2 origin-top-left',
  'bottom-right': 'top-full right-0 mt-2 origin-top-right',
  'top-left': 'bottom-full left-0 mb-2 origin-bottom-left',
  'top-right': 'bottom-full right-0 mb-2 origin-bottom-right',
};

const variants = {
  default: 'text-surface-300 hover:text-surface-100 hover:bg-surface-800',
  danger: 'text-danger-400 hover:text-white hover:bg-danger-600/30',
};

const Dropdown = ({
  trigger,
  items,
  position = 'bottom-right',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`
            absolute z-50 min-w-44 py-1.5 glass rounded-xl shadow-glow-sm border border-surface-800
            animate-fade-up ${positions[position]}
          `}
        >
          {items.map((item, idx) => (
            <button
              key={idx}
              className={`
                w-full flex items-center gap-2.5 px-4 py-2 text-sm text-left font-medium
                transition-all duration-150 first:rounded-t-lg last:rounded-b-lg
                ${variants[item.variant || 'default']}
              `}
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
            >
              {item.icon && <span className="shrink-0">{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
export { Dropdown };
