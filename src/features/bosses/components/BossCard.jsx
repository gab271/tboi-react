import React from 'react';
import { cn } from '../../../lib/utils';
import { FaSkull } from 'react-icons/fa';

export function BossCard({ boss, index, onClick }) {
  // Random rotation for the "pinned" look
  // Using useMemo to keep rotation constant per mount to avoid jitter on re-render
  const rotation = React.useMemo(() => (Math.random() * 6 - 3).toFixed(1), []);
  
  // Animation delay based on index for staggering
  const style = {
      '--tw-rotate': `${rotation}deg`,
      animationDelay: `${Math.min(index * 0.1, 1.5)}s` // Cap delay to avoid waiting too long
  };

  return (
    <div 
      className={cn(
        "group relative w-full aspect-[3/4] flex flex-col items-center",
        "bg-[#f4e4bc] p-4 cursor-pointer",
        "shadow-[2px_4px_8px_rgba(0,0,0,0.3)] hover:shadow-[4px_8px_16px_rgba(0,0,0,0.4)]",
        "transition-transform duration-300 ease-out hover:scale-[1.02]",
        "opacity-0 animate-pinned-drop origin-top", // Initial state driven by animation
        "before:content-[''] before:absolute before:inset-0 before:bg-noise before:opacity-10 before:mix-blend-multiply pointer-events-auto"
      )}
      style={{
          transform: `rotate(${rotation}deg)`,
          ...style
      }}
      onClick={() => onClick(boss)}
    >
      
      {/* Visual Pin/Tack */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 drop-shadow-md">
         {/* Simple CSS Pin */}
         <div className="w-4 h-4 rounded-full bg-red-800 border-[1px] border-black/50 shadow-inner relative">
            <div className="absolute top-[3px] left-[3px] w-1.5 h-1.5 rounded-full bg-red-400 opacity-50"></div>
         </div>
         <div className="w-1 h-3 bg-gray-400 absolute left-1/2 -translate-x-1/2 top-3 rounded-b-full"></div>
      </div>

      {/* Header: WANTED */}
      <div className="w-full text-center border-b-2 border-[#5c3a21] border-dashed mb-2 pb-1 relative">
         <h2 className="font-heading text-3xl md:text-4xl text-[#3d2314] tracking-widest uppercase drop-shadow-sm select-none">
            WANTED
         </h2>
      </div>

      {/* Boss Image Container (Hand Drawn Frame) */}
      <div className="relative flex-1 w-full bg-[#e8dcc5] border-4 border-[#2a1a10] p-2 overflow-hidden shadow-inner group-hover:border-[#8b0000] transition-colors">
         {/* Inner vignette */}
         <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_50%,rgba(0,0,0,0.1)_100%)] z-10 pointer-events-none"></div>
         
         {boss.image ? (
            <img 
                src={boss.image} 
                alt={boss.name} 
                className="w-full h-full object-contain mix-blend-multiply contrast-125 filter sepia-[0.3] group-hover:scale-110 group-hover:sepia-0 transition-all duration-300 relative z-0" 
                loading="lazy" 
            />
         ) : (
            <div className="w-full h-full flex items-center justify-center text-[#2a1a10]/20 text-5xl">
                <FaSkull />
            </div>
         )}
      </div>

      {/* Footer Info */}
      <div className="w-full mt-3 text-center">
         <h3 className="font-handwriting font-bold text-2xl text-[#1a1a1a] uppercase mb-1 truncate">
            {boss.name}
         </h3>
         
         {/* Reward / Location Stamp */}
         <div className="flex items-center justify-center gap-2 text-[#8b0000] opacity-80 rotate-1">
             <span className="font-heading text-lg">REWARD:</span>
             <span className="font-handwriting font-bold border-2 border-[#8b0000] px-2 py-0.5 rounded text-sm -rotate-2">
                 {boss.location || 'Unknown'}
             </span>
         </div>
      </div>

      {/* Paper texture overlay for grunge */}
      <div className="absolute inset-0 border-[1px] border-black/10 pointer-events-none mix-blend-multiply"></div>
      
    </div>
  );
}
