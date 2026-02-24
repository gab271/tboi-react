/**
 * BuildItemSlot - Slot individual de item en el Build Lab
 * Versión exportable que se puede usar en otras partes de la app
 */
import { memo } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaStar } from 'react-icons/fa';
import { cn } from '../../../lib/utils';

export const BuildItemSlot = memo(function BuildItemSlot({ 
  item, 
  onRemove,
  size = 'md',
  showName = false,
  draggable = false,
}) {
  const imageUrl = item?.image || item?.sprite_url;
  const isHighQuality = item?.quality >= 4;
  const isPriority = item?.priority >= 800;
  
  const sizes = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };
  
  if (!item) {
    // Empty slot
    return (
      <div className={cn(
        "border-2 border-dashed border-gray-700 rounded flex items-center justify-center",
        "text-gray-700",
        sizes[size]
      )}>
        <span className="font-pixel text-xl">?</span>
      </div>
    );
  }
  
  return (
    <motion.div
      layout
      className={cn(
        "group relative bg-gray-900 rounded overflow-hidden cursor-pointer",
        "border-2 transition-all duration-200",
        isHighQuality ? "border-accent-gold" : "border-gray-700",
        "hover:border-white hover:scale-105",
        sizes[size],
        draggable && "cursor-grab active:cursor-grabbing"
      )}
    >
      {/* Item Image */}
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={item.name}
          className="w-full h-full object-contain p-1 pixelated"
          loading="lazy"
          draggable={false}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-gray-600 font-pixel text-lg">?</span>
        </div>
      )}
      
      {/* Priority Badge */}
      {isPriority && (
        <div 
          className="absolute top-0 right-0 w-3 h-3 bg-accent-gold rounded-bl" 
          title="High Priority Item" 
        />
      )}
      
      {/* Hover Overlay */}
      <div className={cn(
        "absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100",
        "transition-opacity flex flex-col items-center justify-center gap-1"
      )}>
        {showName && (
          <span className="text-white text-[8px] font-pixel text-center px-1 leading-tight line-clamp-2">
            {item.name}
          </span>
        )}
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-1.5 bg-red-600 rounded-full hover:bg-red-500 transition-colors"
          >
            <FaTimes className="text-white text-xs" />
          </button>
        )}
      </div>
      
      {/* Quality Badge para slots grandes */}
      {size === 'lg' && item.quality !== undefined && (
        <div className={cn(
          "absolute bottom-0 left-0 right-0 bg-black/80 py-0.5 text-center",
          "text-[10px] font-bold",
          item.quality === 4 && "text-yellow-400",
          item.quality === 3 && "text-purple-400",
          item.quality === 2 && "text-blue-400",
          item.quality === 1 && "text-green-400",
          item.quality === 0 && "text-gray-400",
        )}>
          Q{item.quality}
        </div>
      )}
    </motion.div>
  );
});
