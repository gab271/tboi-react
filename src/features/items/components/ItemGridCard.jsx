import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import FavoriteButton from '../../../components/ui/FavoriteButton';
import { FaFingerprint, FaBookOpen } from 'react-icons/fa';

export function ItemGridCard({ item, index }) {
  // Determine border color based on type
  const typeColors = {
    active: 'border-green-500/20 hover:border-green-500/50',
    passive: 'border-blue-500/20 hover:border-blue-500/50',
    trinket: 'border-yellow-500/20 hover:border-yellow-500/50',
    card: 'border-purple-500/20 hover:border-purple-500/50',
    default: 'border-white/10 hover:border-white/30'
  };

  // Safe type access
  const safeType = item.item_type || 'default';
  const borderColor = typeColors[safeType.toLowerCase()] || typeColors.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={cn(
        "group relative bg-bg-1 rounded-xl border p-4 flex flex-col items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden",
        borderColor
      )}
    >
      {/* Background Gradient Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Favorite Button (Floating) */}
      <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
         <FavoriteButton entityType="item" entityId={item.id} />
      </div>

      {/* Item Icon */}
      <div className="w-16 h-16 relative z-10 filter drop-shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-110">
         {item.image ? (
            <img src={item.image} alt={item.name} className="w-full h-full object-contain" loading="lazy" />
         ) : (
            <div className="w-full h-full bg-white/5 rounded-full flex items-center justify-center">
                <FaBookOpen className="text-white/20" />
            </div>
         )}
      </div>

      {/* Item Info */}
      <div className="text-center w-full z-10">
        <h3 className="font-bold text-fg text-sm mb-1 truncate group-hover:text-white transition-colors">
            {item.name}
        </h3>
        
        <p className="text-xs text-muted-foreground line-clamp-2 h-8 leading-tight">
            {item.description || "No description available."}
        </p>
      </div>

      {/* Type Badge */}
      <div className="mt-2 px-2 py-0.5 rounded-full bg-bg-2 border border-white/5 text-[10px] uppercase tracking-wider font-mono text-muted">
         {item.item_type || 'Unknown'}
      </div>

      {/* Hidden Overlay for "Click details" if we implement links later */}
      {/* <div className="absolute inset-0 z-0 cursor-pointer" onClick={() => navigate(...)} /> */}
    </motion.div>
  );
}
