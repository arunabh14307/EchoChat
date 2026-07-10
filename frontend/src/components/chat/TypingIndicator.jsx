import React from 'react';

/**
 * TypingIndicator — displays bouncing dots in a glassmorphic bubble.
 */
const TypingIndicator = () => {
  return (
    <div className="flex items-center gap-1.5 px-4 py-2.5 bg-surface-900 border border-surface-800 rounded-2xl w-fit max-w-[80%] shadow-glow-sm">
      <span className="text-xs text-surface-400 font-sans mr-1 select-none">typing</span>
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce-dot [animation-delay:-0.32s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce-dot [animation-delay:-0.16s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce-dot" />
      </div>
    </div>
  );
};

export default TypingIndicator;
export { TypingIndicator };
