/**
 * Spinner — animated loading indicator.
 *
 * @param {{ size?: 'sm'|'md'|'lg', className?: string }} props
 */
const sizeMap = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-[3px]',
};

const Spinner = ({ size = 'md', className = '' }) => {
  return (
    <span
      className={`inline-block rounded-full border-transparent border-t-current animate-spin ${sizeMap[size]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
};

export default Spinner;
