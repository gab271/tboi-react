import React from 'react';
import { cn } from '../../lib/utils';
import { FaSearch } from 'react-icons/fa';

export function Input({ className, icon: Icon, onClear, value, ...props }) {
  return (
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
          <Icon size={14} />
        </div>
      )}
      <input
        value={value}
        className={cn(
          'bg-bg-0 border border-border rounded-md px-4 py-2 text-fg placeholder-muted/50 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all w-full',
          Icon && 'pl-9',
          className
        )}
        {...props}
      />
      {value && onClear && (
        <button 
           onClick={onClear}
           className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-fg"
        >
          &times;
        </button>
      )}
    </div>
  );
}
