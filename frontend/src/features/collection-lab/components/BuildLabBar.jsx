/**
 * BuildLabBar - Barra superior con items seleccionados
 * Se muestra cuando el modo Build Lab está activo
 */
import { useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { FaTimes, FaTrash, FaUndo, FaCrown, FaLock } from 'react-icons/fa';
import { useBuildLab } from '../hooks/useBuildLab';
import { useFeatures } from '../../../hooks/useFeatures';
import { cn } from '../../../lib/utils';

export function BuildLabBar({ className }) {
  const { 
    selectedItems, 
    removeItem, 
    clearBuild, 
    undo, 
    canUndo,
    itemLimit,
    canAddMoreItems,
    reorderItems 
  } = useBuildLab();
  
  const { isPro } = useFeatures();
  
  // Slots vacíos para visualización
  const emptySlots = useMemo(() => {
    const maxVisible = Math.min(itemLimit, 12);
    const empty = maxVisible - selectedItems.length;
    return Array(Math.max(0, empty)).fill(null);
  }, [selectedItems.length, itemLimit]);
  
  if (selectedItems.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={cn(
          "bg-black/95 border-b-2 border-accent-gold/30 py-6 px-4 lg:px-8",
          className
        )}
      >
        <div className="max-w-screen-2xl mx-auto text-center">
          <p className="font-pixel text-gray-500 text-lg">
            Click on items to add them to your build
          </p>
          <p className="font-handwriting text-accent-gold/60 text-sm mt-1">
            {isPro ? 'Unlimited items' : `Free users: ${itemLimit} items max`}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "bg-black/95 border-b-2 border-accent-gold py-4 px-4 lg:px-8",
        "shadow-[0_4px_20px_rgba(0,0,0,0.5)]",
        className
      )}
    >
      <div className="max-w-screen-2xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="font-heading text-white text-xl uppercase tracking-wider">
              Your Build
            </h3>
            <span className="font-pixel text-accent-gold text-sm">
              {selectedItems.length}{!isPro && ` / ${itemLimit}`}
            </span>
            {!isPro && !canAddMoreItems && (
              <span className="flex items-center gap-1 text-xs text-yellow-500 font-bold">
                <FaCrown className="text-yellow-400" />
                Upgrade for unlimited
              </span>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            {canUndo && (
              <button
                onClick={undo}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Undo"
              >
                <FaUndo />
              </button>
            )}
            <button
              onClick={clearBuild}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-600/20 text-red-400 hover:bg-red-600/40 hover:text-red-300 transition-colors rounded text-sm font-bold"
            >
              <FaTrash className="text-xs" />
              Clear
            </button>
          </div>
        </div>
        
        {/* Items Grid - Reorderable */}
        <Reorder.Group 
          axis="x" 
          values={selectedItems} 
          onReorder={reorderItems}
          className="flex flex-wrap gap-2"
        >
          <AnimatePresence mode="popLayout">
            {selectedItems.map((item) => (
              <Reorder.Item
                key={item.id}
                value={item}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
                whileDrag={{ scale: 1.05, zIndex: 50 }}
                className="cursor-grab active:cursor-grabbing"
              >
                <BuildItemSlot 
                  item={item} 
                  onRemove={() => removeItem(item.id)}
                />
              </Reorder.Item>
            ))}
            
            {/* Empty Slots */}
            {emptySlots.map((_, index) => (
              <motion.div
                key={`empty-${index}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                className="w-16 h-16 border-2 border-dashed border-gray-700 rounded flex items-center justify-center"
              >
                {!canAddMoreItems && index === 0 && (
                  <FaLock className="text-gray-600 text-xs" />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </Reorder.Group>
        
      </div>
    </motion.div>
  );
}

// Item Slot Component
function BuildItemSlot({ item, onRemove }) {
  const imageUrl = item.image || item.sprite_url;
  const isHighQuality = item.quality >= 4;
  
  return (
    <div 
      className={cn(
        "group relative w-16 h-16 bg-gray-900 rounded overflow-hidden",
        "border-2 transition-all duration-200",
        isHighQuality ? "border-accent-gold" : "border-gray-700",
        "hover:border-white hover:scale-105"
      )}
    >
      {/* Item Image */}
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={item.name}
          className="w-full h-full object-contain p-1 pixelated"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-gray-600 font-pixel text-lg">?</span>
        </div>
      )}
      
      {/* Hover Overlay with Remove */}
      <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
        <span className="text-white text-[8px] font-pixel text-center px-1 leading-tight line-clamp-2 mb-1">
          {item.name}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="p-1 bg-red-600 rounded-full hover:bg-red-500 transition-colors"
        >
          <FaTimes className="text-white text-xs" />
        </button>
      </div>
      
      {/* Priority Badge */}
      {item.priority && item.priority >= 800 && (
        <div className="absolute top-0 right-0 w-3 h-3 bg-accent-gold rounded-bl" title="High Priority Item" />
      )}
    </div>
  );
}
