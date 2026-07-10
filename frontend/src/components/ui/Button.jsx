import Spinner from './Spinner';

/**
 * Button — primary UI button with variants and loading state.
 *
 * @param {{
 *   variant?: 'primary'|'ghost'|'danger'|'outline',
 *   size?: 'sm'|'md'|'lg',
 *   isLoading?: boolean,
 *   loadingText?: string,
 *   leftIcon?: React.ReactNode,
 *   rightIcon?: React.ReactNode,
 *   className?: string,
 *   children: React.ReactNode,
 *   [key: string]: any
 * }} props
 */

const base =
  'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none select-none';

const variants = {
  primary:
    'bg-primary-600 hover:bg-primary-500 active:bg-primary-700 text-white focus-visible:ring-primary-500 focus-visible:ring-offset-surface-950 shadow-[0_0_12px_-2px_rgba(99,102,241,0.4)] hover:shadow-[0_0_20px_-2px_rgba(99,102,241,0.6)]',
  ghost:
    'text-surface-400 hover:text-surface-100 hover:bg-surface-800 focus-visible:ring-surface-600 focus-visible:ring-offset-surface-950',
  danger:
    'bg-danger-600 hover:bg-danger-500 active:bg-danger-700 text-white focus-visible:ring-danger-500 focus-visible:ring-offset-surface-950',
  outline:
    'border border-surface-700 hover:border-surface-500 text-surface-300 hover:text-surface-100 hover:bg-surface-800 focus-visible:ring-surface-600 focus-visible:ring-offset-surface-950',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

const Button = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText,
  leftIcon,
  rightIcon,
  className = '',
  children,
  disabled,
  ...rest
}) => {
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? (
        <>
          <Spinner size="sm" />
          {loadingText || children}
        </>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;
