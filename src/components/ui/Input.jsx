import React from 'react';
import { cn } from '../../lib/utils';
import { FaSearch } from 'react-icons/fa';

export function Input({ className, icon: Icon, onClear, value, ...props }) {
  return (
    <div className="relative group">
      {Icon && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 text-text-ink pointer-events-none group-focus-within:text-accent-blood transition-colors">
          <Icon size={16} />
        </div>
      )}
      <input
        value={value}
        className={cn(
          'ink-input w-full focus:border-accent-blood transition-colors placeholder:font-handwriting',
          Icon && 'pl-8', 
          className
        )}
        {...props}
      />
      {value && onClear && (
        <button 
           onClick={onClear}
           className="absolute right-0 top-1/2 -translate-y-1/2 text-text-ink hover:text-accent-blood font-bold text-xl"
        >
          &times;
        </button>
      )}
    </div>
  );
}
