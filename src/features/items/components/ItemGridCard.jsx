import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import FavoriteButton from '../../../components/ui/FavoriteButton';
import { FaBookOpen } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export function ItemGridCard({ item, index, onClick }) {
  const navigate = useNavigate();

  const handleClick = () => {
      if (onClick) {
          onClick(item);
          return;
      }
      const identifier = item.slug || item.id;
      if(identifier) {
        navigate(`/items/${identifier}`);
      }
  };

  // Generate a consistent pseudo-random rotation based on name length so the grid looks organic but stable
  const rotation = (item.name.length % 5) - 2; // -2 to +2 degrees

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ 
          scale: 1.05, 
          rotate: rotation * -1.5, // Counter-tilt on hover
          zIndex: 10
      }}
      onClick={handleClick}
      className={cn(
        "group relative flex flex-col items-center bg-[#fdfbf7] p-3 pb-8 cursor-pointer",
        "shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]", // Subtle initial shadow
        "hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.2),0_10px_10px_-5px_rgba(0,0,0,0.04)]", // Lifted shadow
        "transition-all duration-300 ease-out",
        "border border-gray-200"
      )}
      style={{
          transform: `rotate(${rotation}deg)` 
      }}
    >
      {/* Tape Effect (Top Center) */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-gray-200/50 blur-sm rounded-full opacity-60"></div>

      {/* Favorite Button (Hidden until hover) */}
      <div 
        className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        onClick={(e) => e.stopPropagation()}
      >
         <FavoriteButton entityType="item" entityId={item.id} />
      </div>

      {/* Image Container (The "Photo") */}
      <div className="w-full aspect-square bg-[#1a1a1a] shadow-inner flex items-center justify-center overflow-hidden border-4 border-white mb-3">
         {item.image ? (
            <img 
              src={item.image} 
              alt={item.name} 
              className="w-4/5 h-4/5 object-contain filter drop-shadow-lg transition-transform duration-500 group-hover:scale-110" 
              loading="lazy" 
            />
         ) : (
            <div className="text-white/20 text-3xl">
                <FaBookOpen />
            </div>
         )}
      </div>

      {/* Text Area (Handwritten Note) */}
      <div className="w-full px-1 text-center">
        <h3 className="font-handwriting font-bold text-2xl leading-none text-text-ink mb-2 group-hover:text-accent-blood transition-colors">
            {item.name}
        </h3>
        
        <p className="font-handwriting text-sm text-text-dim leading-none line-clamp-2 italic">
            {item.description_short || item.quote || "Unknown Artifact"}
        </p>
      </div>

      {/* Item Type Symbol / Stamp */}
      <div className="absolute bottom-2 right-2 opacity-20 pointer-events-none rotate-12">
          {['active', 'passive'].includes(item.item_type?.toLowerCase()) && (
              <span className={`font-heading text-[0.6rem] border-2 px-1 rounded-sm uppercase ${item.item_type === 'active' ? 'border-green-800 text-green-900' : 'border-blue-800 text-blue-900'}`}>
                  {item.item_type}
              </span>
          )}
      </div>

    </motion.div>
  );
}
