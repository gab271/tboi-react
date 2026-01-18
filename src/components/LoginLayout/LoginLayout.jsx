import React from 'react';
import { DustParticles } from './DustParticles';
import { cn } from '../../lib/utils';

export const LoginLayout = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full bg-[#090909] flex flex-col items-center justify-center overflow-hidden font-sans text-text-heading">
      
      {/* 1. Atmospheric Background Layer */}
      <DustParticles count={40} />
      
      {/* 2. Main Content Wrapper (Z-index 10 to sit above dust) */}
      <div className="relative z-10 w-full max-w-md px-4">
        
        {/* The "Sheet of Paper" Container */}
        <div 
            className={cn(
                "relative bg-[#fdfbf7] p-8 md:p-10",
                "shadow-[0_0_50px_-5px_rgba(0,0,0,0.7)]", // Deep warm shadow
                "transition-transform duration-500",
                // Simulate torn/imperfect edges slightly with clip-path or just irregular border radius
                // Using a subtle rotation for 'placed on table' feel
                "rotate-1 sm:rotate-0"
            )}
            style={{
                borderRadius: '2px 2px 2px 2px', // Slightly rounded
                // CSS Texture Overlay for paper grain
                backgroundImage: `
                    url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E"), 
                    linear-gradient(to bottom right, #fdfbf7, #f0e6d2)
                `
            }}
        >
            {/* Optional: Tape or Fold visual at the top */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-8 bg-[#e8e1cf] opacity-80 rotate-1 shadow-sm transform skew-x-12" />

            {/* Inner Content */}
            {children}
            
            {/* Footer decoration inside the card */}
            <div className="mt-8 pt-4 border-t-2 border-black/10 border-dashed text-center">
                 <p className="font-handwriting text-black/40 text-sm">
                    Only the penitent man shall pass...
                 </p>
            </div>
        </div>

      </div>

      {/* 3. Global Footer (outside paper) */}
      <footer className="absolute bottom-4 left-0 w-full text-center text-white/20 font-pixel text-xs z-10">
         TBOI Codex &copy; {new Date().getFullYear()}
      </footer>

    </div>
  );
};
