import React, { forwardRef } from 'react';

/**
 * Input component — reusable, styled input element with label and error support.
 *
 * @param {{
 *   label?: string,
 *   error?: string | null,
 *   leftIcon?: React.ReactNode,
 *   rightIcon?: React.ReactNode,
 *   className?: string,
 *   containerClassName?: string,
 *   [key: string]: any
 * }} props
 */
const Input = forwardRef(({
  label,
  error,
  leftIcon,
  rightIcon,
  className = '',
  containerClassName = '',
  ...rest
}, ref) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`}>
      {label && (
        <label className="text-sm font-medium text-surface-300 select-none">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 text-surface-500 shrink-0 flex items-center justify-center">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={`
            w-full bg-surface-800 border rounded-xl px-4 py-2.5
            text-surface-100 placeholder-surface-500 text-sm
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            transition-all duration-200
            ${leftIcon ? 'pl-11' : ''}
            ${rightIcon ? 'pr-11' : ''}
            ${error ? 'border-danger-500 focus:ring-danger-500' : 'border-surface-700 hover:border-surface-650'}
            ${className}
          `}
          {...rest}
        />
        {rightIcon && (
          <div className="absolute right-3.5 text-surface-500 shrink-0 flex items-center justify-center">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <span className="text-xs text-danger-500 animate-fade-in">
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
