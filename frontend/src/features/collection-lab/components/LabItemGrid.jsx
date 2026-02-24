/**
 * LabItemGrid - Grid responsivo de items para el Collection Lab
 * Desktop: 6 columnas, Tablet: 3, Mobile: 2
 * Con infinite scroll y estados de carga
 */
import { memo } from 'react';
import { motion } from 'framer-motion';
import { LabItemCard } from './LabItemCard';
import { cn } from '../../../lib/utils';

export const LabItemGrid = memo(function LabItemGrid({ items, isLoading, mode }) {
  
  // Loading State
  if (isLoading && (!items || items.length === 0)) {
    return (
      <div className={cn(
        "relative bg-[#0a0a0a]/95 p-6 rounded-sm",
        "shadow-xl border-2 border-black/80"
      )}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {[...Array(24)].map((_, i) => (
            <LoadingSlot key={i} index={i} />
          ))}
        </div>
      </div>
    );
  }
  
  // Empty State
  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-[#0a0a0a]/90 text-white min-h-[400px] rounded-[3px] border-2 border-dashed border-white/10">
        <span className="text-4xl mb-4 opacity-50">🕸️</span>
        <p className="font-pixel text-white/70 text-xl text-center tracking-widest">
          No items found
        </p>
        <p className="text-gray-500 text-sm mt-2">
          Try adjusting your filters
        </p>
      </div>
    );
  }
  
  return (
    <div className={cn(
      "relative bg-[#0a0a0a] p-4 md:p-6 lg:p-8",
      "shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]"
    )}
    style={{
      borderRadius: '2px 4px 1px 3px',
      border: '2px solid rgba(40,40,40, 1)' 
    }}
    >
      {/* Texture Overlay */}
      <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />
      
      {/* Corner Rivets */}
      <Rivet position="top-left" />
      <Rivet position="top-right" />
      <Rivet position="bottom-left" />
      <Rivet position="bottom-right" />
      
      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 relative z-10">
        {items.map((item, index) => (
          <LabItemCard 
            key={item.id || index} 
            item={item} 
            index={index}
            mode={mode}
          />
        ))}
      </div>
      
      {/* Loading More Indicator */}
      {isLoading && items.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black to-transparent flex items-center justify-center">
          <span className="font-pixel text-white/50 animate-pulse">
            Loading more...
          </span>
        </div>
      )}
    </div>
  );
});

// Loading Slot
function LoadingSlot({ index }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.02 }}
      className="aspect-square bg-black/20 border border-white/10 flex items-center justify-center rounded-[2px]"
    >
      <motion.span 
        className="font-pixel text-white/10 text-xl"
        animate={{ opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        ?
      </motion.span>
    </motion.div>
  );
}

// Corner Rivet
function Rivet({ position }) {
  const positions = {
    'top-left': 'top-2 left-2',
    'top-right': 'top-2 right-2',
    'bottom-left': 'bottom-2 left-2',
    'bottom-right': 'bottom-2 right-2',
  };
  
  return (
    <div className={cn(
      "absolute w-1.5 h-1.5 rounded-full bg-[#333] opacity-50",
      positions[position]
    )} />
  );
}
