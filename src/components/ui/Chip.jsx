import React from 'react';
import { cn } from '../../lib/utils';

export function Chip({ children, active, className, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
        active 
          ? 'bg-moss/20 border-moss text-moss' 
          : 'bg-bg-1 border-border text-muted hover:border-muted hover:text-fg',
        className
      )}
    >
      {children}
    </button>
  );
}
