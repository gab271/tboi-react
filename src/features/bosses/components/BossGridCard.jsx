import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { FaSkull, FaHeart } from 'react-icons/fa';

export function BossGridCard({ boss, index, onClick }) {

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -5, scale: 1.02 }}
      onClick={() => onClick(boss)}
      className={cn(
        "group relative bg-bg-1 rounded-xl border border-white/10 hover:border-blood/50 p-4 flex flex-col items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden cursor-pointer"
      )}
    >
      {/* Background Gradient Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blood/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Boss Image */}
      <div className="w-20 h-20 relative z-10 filter drop-shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-110">
         {boss.image ? (
            <img src={boss.image} alt={boss.name} className="w-full h-full object-contain" loading="lazy" />
         ) : (
            <div className="w-full h-full bg-white/5 rounded-full flex items-center justify-center">
                <FaSkull className="text-white/20 text-3xl" />
            </div>
         )}
      </div>

      {/* Boss Info */}
      <div className="text-center w-full z-10">
        <h3 className="font-bold text-fg text-lg mb-1 truncate group-hover:text-blood transition-colors">
            {boss.name}
        </h3>
        
        <div className="flex items-center justify-center gap-3 text-xs text-muted">
            <span className="flex items-center gap-1">
                <FaHeart className="text-blood" /> {boss.health || '?'}
            </span>
             
             {boss.location && (
                 <span className="px-2 py-0.5 rounded-full bg-bg-2 border border-white/5 capitalize">
                    {boss.location}
                 </span>
             )}
        </div>
      </div>
    </motion.div>
  );
}
