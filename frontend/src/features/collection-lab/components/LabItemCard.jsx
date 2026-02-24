/**
 * LabItemCard - Tarjeta de item para el Collection Lab
 * Incluye hover card premium, overlay de progreso, y acciones contextuales
 */
import { useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaMinus, FaBalanceScale, FaLock, FaStar, FaBrain, FaChartLine } from 'react-icons/fa';
import { useBuildLab } from '../hooks/useBuildLab';
import { useUserItemProgress } from '../hooks/useUserItemProgress';
import { useFeatures } from '../../../hooks/useFeatures';
import { cn } from '../../../lib/utils';
import { ItemHoverCard } from './ItemHoverCard';

export function LabItemCard({ item, index, mode }) {
  const [showHover, setShowHover] = useState(false);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);
  
  const { 
    addItem, 
    removeItem, 
    isItemSelected, 
    toggleCompareItem, 
    isItemInCompare,
    canAddMoreItems 
  } = useBuildLab();
  
  const { getItemStatus, hasSaveData } = useUserItemProgress();
  const { isPro } = useFeatures();
  
  const isSelected = isItemSelected(item.id);
  const isInCompare = isItemInCompare(item.id);
  const itemStatus = getItemStatus(item.id);
  const highQuality = item.quality >= 4;
  
  // Manejar hover para mostrar card premium
  const handleMouseEnter = (e) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setHoverPosition({
        x: rect.right + 10,
        y: rect.top,
      });
    }
    setShowHover(true);
  };
  
  const handleMouseLeave = () => {
    setShowHover(false);
  };
  
  // Click handler basado en modo
  const handleClick = () => {
    if (mode === 'buildlab') {
      if (isSelected) {
        removeItem(item.id);
      } else if (canAddMoreItems) {
        addItem(item);
      }
    } else if (mode === 'compare') {
      toggleCompareItem(item);
    }
  };
  
  // Determinar estado visual
  const visualState = useMemo(() => {
    if (hasSaveData && itemStatus.isLocked) return 'locked';
    if (isSelected) return 'selected';
    if (isInCompare) return 'compare';
    if (itemStatus.isFrequent) return 'frequent';
    return 'default';
  }, [hasSaveData, itemStatus, isSelected, isInCompare]);
  
  return (
    <>
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: Math.min(index * 0.02, 0.3) }}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        whileHover={{ 
          scale: mode !== 'collection' ? 1.1 : 1.08,
          transition: { duration: 0.15 } 
        }}
        className={cn(
          "group relative w-full aspect-square cursor-pointer overflow-hidden",
          "border-2 shadow-md transition-all duration-200",
          // Estado base
          visualState === 'default' && "bg-[#1a1a1a] border-[#404040]",
          visualState === 'default' && highQuality && "hover:border-accent-gold",
          visualState === 'default' && !highQuality && "hover:border-white",
          // Locked
          visualState === 'locked' && "bg-[#0a0a0a] border-[#252525] grayscale opacity-60",
          // Selected
          visualState === 'selected' && "bg-green-900/30 border-green-500 ring-2 ring-green-500/50",
          // Compare
          visualState === 'compare' && "bg-blue-900/30 border-blue-500 ring-2 ring-blue-500/50",
          // Frequent
          visualState === 'frequent' && "bg-yellow-900/10 border-yellow-600/50",
        )}
        style={{
          borderRadius: '4px 6px 3px 5px / 5px 3px 6px 4px'
        }}
      >
        {/* Background Glow */}
        <div className={cn(
          "absolute inset-0 bg-radial-gradient opacity-0 transition-opacity duration-300 pointer-events-none",
          visualState === 'selected' && "from-green-500/30 to-transparent opacity-60",
          visualState === 'compare' && "from-blue-500/30 to-transparent opacity-60",
          visualState === 'frequent' && "from-yellow-500/20 to-transparent opacity-40",
          visualState === 'default' && "group-hover:opacity-30",
          visualState === 'default' && highQuality && "from-accent-gold/50 to-transparent",
          visualState === 'default' && !highQuality && "from-white/20 to-transparent",
        )} />
        
        {/* Item Image */}
        <div className="relative z-10 p-3 h-full flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
          {item.image || item.sprite_url ? (
            <img 
              src={item.image || item.sprite_url} 
              alt={item.name} 
              className={cn(
                "max-w-full max-h-full object-contain rendering-pixelated",
                "drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]",
                visualState === 'locked' && "grayscale"
              )}
              loading="lazy"
            />
          ) : (
            <div className="w-12 h-12 bg-white/10 rounded-full animate-pulse" />
          )}
        </div>
        
        {/* Status Badges */}
        <div className="absolute top-1 left-1 flex gap-1 z-20">
          {visualState === 'locked' && (
            <span className="p-1 bg-black/80 rounded" title="Locked">
              <FaLock className="text-gray-500 text-xs" />
            </span>
          )}
          {itemStatus.isFrequent && (
            <span className="p-1 bg-yellow-600/80 rounded" title={`Used ${itemStatus.usageCount} times`}>
              <FaStar className="text-yellow-200 text-xs" />
            </span>
          )}
          {itemStatus.inUserBuilds > 0 && (
            <span className="p-1 bg-purple-600/80 rounded" title={`In ${itemStatus.inUserBuilds} of your builds`}>
              <FaBrain className="text-purple-200 text-xs" />
            </span>
          )}
        </div>
        
        {/* Quality Badge */}
        {item.quality !== undefined && item.quality !== null && (
          <div className={cn(
            "absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded text-xs font-bold z-20",
            item.quality === 4 && "bg-yellow-500 text-black",
            item.quality === 3 && "bg-purple-500 text-white",
            item.quality === 2 && "bg-blue-500 text-white",
            item.quality === 1 && "bg-green-600 text-white",
            item.quality === 0 && "bg-gray-600 text-white",
          )}>
            {item.quality}
          </div>
        )}
        
        {/* Selection Indicator */}
        {isSelected && (
          <div className="absolute top-1 right-1 p-1 bg-green-500 rounded-full z-30">
            <FaMinus className="text-white text-xs" />
          </div>
        )}
        {isInCompare && (
          <div className="absolute top-1 right-1 p-1 bg-blue-500 rounded-full z-30">
            <FaBalanceScale className="text-white text-xs" />
          </div>
        )}
        
        {/* Hover Actions (solo en collection mode) */}
        {mode === 'collection' && canAddMoreItems && !isSelected && (
          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20">
            <button
              onClick={(e) => {
                e.stopPropagation();
                addItem(item);
              }}
              className="p-2 bg-green-600 hover:bg-green-500 rounded-full transition-colors"
              title="Add to Build Lab"
            >
              <FaPlus className="text-white" />
            </button>
            {isPro && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCompareItem(item);
                }}
                className="p-2 bg-blue-600 hover:bg-blue-500 rounded-full transition-colors"
                title="Compare"
              >
                <FaBalanceScale className="text-white" />
              </button>
            )}
          </div>
        )}
        
        {/* Name Tooltip (Bottom) */}
        <div className={cn(
          "absolute inset-x-0 bottom-0 bg-black/90 p-1.5",
          "translate-y-full group-hover:translate-y-0 transition-transform duration-200",
          "flex flex-col items-center z-20"
        )}>
          <span className={cn(
            "font-pixel text-xs text-center leading-tight tracking-wide",
            highQuality ? "text-accent-gold" : "text-white"
          )}>
            {item.name}
          </span>
        </div>
        
        {/* Frequent Glow Effect */}
        {visualState === 'frequent' && (
          <div 
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              boxShadow: 'inset 0 0 15px rgba(255, 215, 0, 0.15)',
            }}
          />
        )}
      </motion.div>
      
      {/* Hover Card Premium */}
      {showHover && (
        <ItemHoverCard 
          item={item} 
          position={hoverPosition}
          itemStatus={itemStatus}
        />
      )}
    </>
  );
}
