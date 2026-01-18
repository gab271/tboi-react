import React from 'react';
import { cn } from '../../lib/utils';

export function Pagination({ currentPage, totalPages, onPageChange, className }) {
  // Helper to ensure page doesn't go out of bounds
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      onPageChange(newPage);
    }
  };

  return (
    <div className={cn("flex items-center justify-center gap-8 py-8", className)}>
      
      {/* Previous Arrow - Hand Drawn Style */}
      <button 
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="group relative p-2 transform transition-transform hover:scale-125 disabled:opacity-20 disabled:pointer-events-none"
        aria-label="Previous Page"
      >
        <svg 
            width="40" 
            height="40" 
            viewBox="0 0 50 50" 
            className="stroke-black stroke-[3] fill-none group-hover:stroke-accent-blood transition-colors duration-200"
            strokeLinecap="round" 
            strokeLinejoin="round"
        >
            {/* Rough Left Arrow */}
            <path d="M 35 10 Q 15 25 35 40" />
            <path d="M 15 25 L 18 22" /> {/* Messy tip detail */}
            <path d="M 15 25 L 18 28" /> 
        </svg>
      </button>

      {/* Page Indicator - Handwritten */}
      <div className="flex flex-col items-center">
          <span className="font-handwriting text-3xl font-bold text-black transform -rotate-1">
             {currentPage + 1} <span className="text-black/40 text-2xl mx-1">/</span> {totalPages}
          </span>
          {/* Underline scribble */}
          <svg width="60" height="10" viewBox="0 0 60 10" className="text-black/20 mt-1">
               <path d="M0 5 Q 30 10 60 2" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 2" />
          </svg>
      </div>

      {/* Next Arrow - Hand Drawn Style */}
      <button 
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
        className="group relative p-2 transform transition-transform hover:scale-125 disabled:opacity-20 disabled:pointer-events-none"
        aria-label="Next Page"
      >
         <svg 
            width="40" 
            height="40" 
            viewBox="0 0 50 50" 
            className="stroke-black stroke-[3] fill-none group-hover:stroke-accent-blood transition-colors duration-200"
            strokeLinecap="round" 
            strokeLinejoin="round"
        >
            {/* Rough Right Arrow */}
            <path d="M 15 10 Q 35 25 15 40" />
            <path d="M 35 25 L 32 22" />
            <path d="M 35 25 L 32 28" />
        </svg>
      </button>

    </div>
  );
}
