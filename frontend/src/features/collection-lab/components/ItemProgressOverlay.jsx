/**
 * ItemProgressOverlay - Overlay visual para mostrar el estado de progreso de un item
 * Se usa cuando el usuario ha subido un save file
 */
import { memo } from 'react';
import { FaLock, FaStar, FaBrain, FaUnlock } from 'react-icons/fa';
import { cn } from '../../../lib/utils';

export const ItemProgressOverlay = memo(function ItemProgressOverlay({ 
  status, 
  showUnlockHint = false 
}) {
  if (!status) return null;
  
  const { isLocked, usageCount, isFrequent, inUserBuilds, isUnlockableNow } = status;
  
  // Locked Item Overlay
  if (isLocked) {
    return (
      <div className={cn(
        "absolute inset-0 z-10 flex flex-col items-center justify-center",
        "bg-black/60 backdrop-grayscale"
      )}>
        <FaLock className="text-gray-500 text-xl mb-1" />
        {showUnlockHint && isUnlockableNow && (
          <span className="text-xs text-green-400 flex items-center gap-1">
            <FaUnlock /> Unlockable
          </span>
        )}
      </div>
    );
  }
  
  // Badges for unlocked items
  const badges = [];
  
  if (isFrequent) {
    badges.push({
      icon: <FaStar />,
      color: 'bg-yellow-600',
      title: `Used ${usageCount} times`,
    });
  }
  
  if (inUserBuilds > 0) {
    badges.push({
      icon: <FaBrain />,
      color: 'bg-purple-600',
      title: `In ${inUserBuilds} builds`,
    });
  }
  
  if (badges.length === 0) return null;
  
  return (
    <div className="absolute top-1 left-1 flex gap-1 z-20">
      {badges.map((badge, i) => (
        <span 
          key={i}
          className={cn(
            "p-1 rounded text-white text-xs",
            badge.color
          )}
          title={badge.title}
        >
          {badge.icon}
        </span>
      ))}
    </div>
  );
});

/**
 * Glow Effect para items frecuentes
 */
export const FrequentGlow = memo(function FrequentGlow({ active }) {
  if (!active) return null;
  
  return (
    <div 
      className="absolute inset-0 pointer-events-none z-0 animate-pulse"
      style={{
        boxShadow: 'inset 0 0 20px rgba(255, 215, 0, 0.2)',
      }}
    />
  );
});

/**
 * Progress Badge específico
 */
export function ProgressBadge({ usageCount, inBuilds }) {
  if (!usageCount && !inBuilds) return null;
  
  return (
    <div className="flex items-center gap-2 text-xs">
      {usageCount > 0 && (
        <span className="flex items-center gap-1 text-yellow-400">
          <FaStar /> {usageCount}x
        </span>
      )}
      {inBuilds > 0 && (
        <span className="flex items-center gap-1 text-purple-400">
          <FaBrain /> {inBuilds} builds
        </span>
      )}
    </div>
  );
}
