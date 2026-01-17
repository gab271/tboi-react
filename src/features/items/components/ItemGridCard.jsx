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
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ 
          scale: 1.05, 
          rotate: rotation - 2, // Slight tilt lift
          y: -5,
          transition: { type: "spring", stiffness: 300, damping: 15 }
      }}
      onClick={handleClick}
      className={cn(
        "group relative flex flex-col items-center bg-[#FDFBF7] p-2 pb-12 cursor-pointer", // pb-12 gives the "Polaroid" bottom lip
        "shadow-[0_2px_8px_-1px_rgba(0,0,0,0.2)]", // Subtle initial shadow
        "hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.3)]", // Lifted shadow
        "transition-shadow duration-300 ease-out",
        "border-[1px] border-black/5" // Very subtle border definition
      )}
      style={{
          transform: `rotate(${rotation}deg)` 
      }}
    >
      {/* Tape Effect (Top Center) - Visual only */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#E5E5E5]/60 backdrop-blur-[1px] -rotate-45 opacity-60 pointer-events-none shadow-sm"></div>

      {/* Favorite Button (Hidden until hover) */}
      <div 
        className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        onClick={(e) => e.stopPropagation()}
      >
         <FavoriteButton entityType="item" entityId={item.id} />
      </div>

      {/* Image Container (The "Photo" part of the Polaroid) */}
      <div className="w-full aspect-square bg-[#0a0a0a] shadow-inner flex items-center justify-center overflow-hidden mb-2 relative group-hover:brightness-110 transition-all border-4 border-white/90">
         
         {/* Placeholder Pattern (Spritesheet ready) */}
         <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]"></div>

         {item.image ? (
            <img 
              src={item.image} 
              alt={item.name} 
              className="w-3/5 h-3/5 object-contain filter drop-shadow-[0_0_10px_rgba(255,255,255,0.1)] relative z-0" 
              loading="lazy" 
            />
         ) : (
             <div className="text-white/20 text-3xl">
                <FaBookOpen />
            </div>
         )}
      </div>

      {/* Text Area (Handwritten Note on the Polaroid bottom) */}
      <div className="w-full px-1 text-center absolute bottom-3 left-0 right-0">
        <h3 className="font-handwriting font-bold text-xl leading-tight text-text-ink truncate px-2 group-hover:text-accent-blood transition-colors">
            {item.name}
        </h3>
      </div>
    </motion.div>
  );
}
