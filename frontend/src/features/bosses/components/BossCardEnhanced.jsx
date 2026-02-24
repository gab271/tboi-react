import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { FaSkull, FaCrown } from 'react-icons/fa';
import { GiCrossedSwords } from 'react-icons/gi';
import { useBossProgress } from '../context/BossProgressContext';
import { DEFEAT_STATUS } from '../types/boss.types';

/**
 * Defeat stamp overlay component
 * Shows different stamps based on defeat status
 */
function DefeatStamp({ status, isAnimating }) {
  if (status === DEFEAT_STATUS.NOT_DEFEATED) return null;
  
  const stamps = {
    [DEFEAT_STATUS.NORMAL]: {
      text: 'DEFEATED',
      color: 'text-[#8b0000]',
      borderColor: 'border-[#8b0000]',
      rotation: '-rotate-12',
      scale: 'scale-100'
    },
    [DEFEAT_STATUS.HARD]: {
      text: 'HARD MODE',
      color: 'text-[#1a1a1a]',
      borderColor: 'border-[#1a1a1a]',
      rotation: '-rotate-6',
      scale: 'scale-110'
    },
    [DEFEAT_STATUS.MASTERED]: {
      text: 'MASTERED',
      color: 'text-[#b45309]',
      borderColor: 'border-[#b45309]',
      rotation: 'rotate-[-15deg]',
      scale: 'scale-100'
    }
  };
  
  const stamp = stamps[status];
  if (!stamp) return null;
  
  return (
    <AnimatePresence>
      <motion.div 
        className={cn(
          "absolute inset-0 flex items-center justify-center pointer-events-none z-30",
          stamp.rotation
        )}
        initial={isAnimating ? { scale: 3, opacity: 0, rotate: -45 } : { scale: 1, opacity: 1 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={isAnimating ? { 
          type: "spring", 
          stiffness: 200, 
          damping: 15,
          duration: 0.6
        } : { duration: 0 }}
      >
        <div 
          className={cn(
            "px-4 py-2 border-4 font-heading text-xl sm:text-2xl uppercase tracking-wider",
            "bg-transparent backdrop-blur-[1px]",
            stamp.color,
            stamp.borderColor,
            stamp.scale,
            // Weathered stamp effect
            "shadow-[2px_2px_4px_rgba(0,0,0,0.3)]",
            "[text-shadow:1px_1px_0_rgba(255,255,255,0.3)]"
          )}
          style={{
            // Ink spread effect
            filter: 'url(#stamp-distortion)'
          }}
        >
          {stamp.text}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Golden pin for mastered bosses
 */
function GoldenPin({ show }) {
  if (!show) return null;
  
  return (
    <motion.div 
      className="absolute -top-2 left-1/2 z-40"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.3 }}
      style={{ transform: 'translateX(-50%)' }}
    >
      {/* Golden pin head */}
      <div className="relative">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#fbbf24] via-[#f59e0b] to-[#b45309] border-2 border-[#92400e] shadow-lg">
          {/* Crown icon */}
          <FaCrown className="absolute inset-0 m-auto w-3 h-3 text-white/80" />
          {/* Shine */}
          <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-white/50" />
        </div>
        {/* Pin needle */}
        <div className="w-1.5 h-4 bg-gradient-to-b from-[#9ca3af] to-[#6b7280] absolute left-1/2 -translate-x-1/2 top-5 rounded-b-full shadow-md" />
      </div>
    </motion.div>
  );
}

/**
 * Aged paper effect overlay for mastered bosses
 */
function AgedPaperOverlay({ show }) {
  if (!show) return null;
  
  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-sm">
      {/* Sepia tint */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#d4a574]/30 to-[#8b7355]/20 mix-blend-multiply" />
      
      {/* Coffee stain */}
      <div 
        className="absolute top-2 right-3 w-12 h-12 rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, #5c3a21 0%, transparent 70%)'
        }}
      />
      
      {/* Fold lines */}
      <div className="absolute top-1/3 left-0 right-0 h-px bg-[#2a1a10]/10" />
      <div className="absolute top-2/3 left-0 right-0 h-px bg-[#2a1a10]/10" />
      
      {/* Corner wear */}
      <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-[#2a1a10]/20 to-transparent" />
      <div className="absolute bottom-0 left-0 w-8 h-8 bg-gradient-to-tr from-[#2a1a10]/20 to-transparent" />
    </div>
  );
}

/**
 * Enhanced Wanted Poster Boss Card
 * Features: defeat states, stamps, hover animations, aging effects
 */
export function BossCardEnhanced({ boss, index, onClick }) {
  const { getBossStatus } = useBossProgress();
  const [isHovered, setIsHovered] = useState(false);
  const [stampAnimating, setStampAnimating] = useState(false);
  
  const status = getBossStatus(boss.id);
  const isMastered = status === DEFEAT_STATUS.MASTERED;
  const isDefeated = status !== DEFEAT_STATUS.NOT_DEFEATED;
  
  // Random variations for organic look
  const variations = useMemo(() => ({
    rotation: (Math.random() * 2 - 1).toFixed(1),
    pinRotation: (Math.random() * 30 - 15).toFixed(0),
    pinOffsetX: (Math.random() * 4 - 2).toFixed(1),
    pinOffsetY: (Math.random() * 4 - 2).toFixed(1)
  }), []);

  const style = {
    '--tw-rotate': `${variations.rotation}deg`,
    animationDelay: `${Math.min(index * 0.08, 1.2)}s`
  };

  return (
    <>
      {/* SVG filter for stamp distortion effect */}
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id="stamp-distortion">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
      
      <motion.div 
        className={cn(
          "group relative w-full aspect-[3/4] flex flex-col items-center",
          "bg-[#f4e4bc] p-3 cursor-pointer",
          "shadow-[2px_4px_8px_rgba(0,0,0,0.3)]",
          "transition-all duration-300 ease-out",
          "opacity-0 animate-pinned-drop origin-top",
          "before:content-[''] before:absolute before:inset-0 before:bg-noise before:opacity-10 before:mix-blend-multiply pointer-events-auto",
          // Defeated state: slightly desaturated
          isDefeated && !isMastered && "saturate-[0.85]",
          // Mastered: aged paper look
          isMastered && "saturate-[0.7] brightness-[0.95]"
        )}
        style={{
          transform: `rotate(${variations.rotation}deg)`,
          ...style
        }}
        onClick={() => onClick(boss)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ 
          scale: 1.03, 
          rotate: 0,
          y: -8,
          boxShadow: '4px 12px 24px rgba(0,0,0,0.4)'
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        
        {/* Aged paper overlay for mastered */}
        <AgedPaperOverlay show={isMastered} />
        
        {/* Golden pin for mastered (replaces regular pin) */}
        <GoldenPin show={isMastered} />
        
        {/* Regular pin for non-mastered */}
        {!isMastered && (
          <motion.div 
            className="absolute -top-3 left-1/2 z-20 drop-shadow-md"
            style={{
              transform: `translate(calc(-50% + ${variations.pinOffsetX}px), ${variations.pinOffsetY}px) rotate(${variations.pinRotation}deg)`
            }}
            animate={isHovered ? { 
              rotate: [0, -5, 5, -3, 0],
              transition: { duration: 0.5, ease: "easeInOut" }
            } : {}}
          >
            <div className={cn(
              "w-4 h-4 rounded-full border-[1px] border-black/50 shadow-inner relative",
              isDefeated ? "bg-gray-600" : "bg-red-800"
            )}>
              <div className="absolute top-[3px] left-[3px] w-1.5 h-1.5 rounded-full bg-white/30" />
            </div>
            <div className="w-1 h-3 bg-gray-400 absolute left-1/2 -translate-x-1/2 top-3 rounded-b-full" />
          </motion.div>
        )}

        {/* Defeat stamp overlay */}
        <DefeatStamp status={status} isAnimating={stampAnimating} />

        {/* Header: WANTED */}
        <div className="w-full text-center border-b-2 border-[#5c3a21] border-dashed mb-1 pb-0.5 relative z-20">
          <h2 className={cn(
            "font-heading text-lg md:text-xl tracking-widest uppercase drop-shadow-sm select-none",
            isDefeated ? "text-[#5c3a21]/70" : "text-[#3d2314]"
          )}>
            WANTED
          </h2>
        </div>

        {/* Boss Image Container */}
        <div className={cn(
          "relative flex-1 w-full bg-[#e8dcc5] border-4 p-2 overflow-hidden shadow-inner transition-colors duration-300 z-20",
          isHovered && !isDefeated ? "border-[#8b0000]" : "border-[#2a1a10]",
          isDefeated && "border-[#5c3a21]/60"
        )}>
          {/* Inner vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_50%,rgba(0,0,0,0.15)_100%)] z-10 pointer-events-none" />
          
          {boss.image ? (
            <motion.img 
              src={boss.image} 
              alt={boss.name} 
              className={cn(
                "w-full h-full object-contain mix-blend-multiply contrast-125 filter relative z-0",
                isDefeated ? "sepia-[0.4] opacity-80" : "sepia-[0.3]",
                isMastered && "sepia-[0.5] opacity-70"
              )}
              loading="lazy"
              whileHover={{ scale: 1.1, filter: "sepia(0)" }}
              transition={{ duration: 0.3 }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#2a1a10]/20 text-5xl">
              <FaSkull />
            </div>
          )}
          
          {/* Defeated X marks for visual feedback */}
          {isDefeated && (
            <motion.div 
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.1 }}
            >
              <GiCrossedSwords className={cn(
                "w-16 h-16",
                isMastered ? "text-[#b45309]" : "text-[#8b0000]"
              )} />
            </motion.div>
          )}
        </div>

        {/* Footer Info */}
        <div className="w-full mt-2 text-center relative z-20">
          <div className="h-10 flex items-center justify-center px-1 w-full mb-1">
            <h3 className={cn(
              "font-handwriting font-bold uppercase line-clamp-2 w-full leading-none",
              isDefeated ? "text-[#3a3a3a]" : "text-[#1a1a1a]",
              boss.name.length < 12 ? "text-xl" :
              boss.name.length < 20 ? "text-sm" : "text-[10px]"
            )}>
              {boss.name}
            </h3>
          </div>
          
          {/* Reward / Location Stamp */}
          <div className={cn(
            "flex flex-col items-center justify-center gap-1 opacity-80 rotate-1 pb-1 mt-1",
            isDefeated ? "text-[#5c3a21]" : "text-[#8b0000]"
          )}>
            <span className="font-heading text-xs md:text-sm">
              {isDefeated ? 'BOUNTY COLLECTED' : 'REWARD:'}
            </span>
            <span className={cn(
              "font-handwriting font-bold border-2 px-2 py-0.5 rounded text-xs -rotate-2 max-w-full truncate",
              isDefeated ? "border-[#5c3a21]" : "border-[#8b0000]"
            )}>
              {boss.location || 'Unknown'}
            </span>
          </div>
        </div>

        {/* Paper texture overlay */}
        <div className="absolute inset-0 border-[1px] border-black/10 pointer-events-none mix-blend-multiply z-40" />
        
        {/* Difficulty indicator */}
        {boss.difficulty && (
          <div className="absolute bottom-2 right-2 flex gap-0.5 z-30">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i}
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  i < boss.difficulty ? "bg-[#8b0000]" : "bg-[#5c3a21]/30"
                )}
              />
            ))}
          </div>
        )}
      </motion.div>
    </>
  );
}

export default BossCardEnhanced;
