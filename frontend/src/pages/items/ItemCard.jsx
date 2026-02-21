import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

export function ItemCard({ item, index, onClick }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick(item);
    } else {
      const identifier = item.slug || item.id;
      if (identifier) navigate(`/items/${identifier}`);
    }
  };

  const highQuality = item.quality >= 4;

  return (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.05 }}
        onClick={handleClick}
        whileHover={{ 
            scale: 1.15,
            transition: { duration: 0.2 } 
        }}
        className={cn(
            "group relative w-full aspect-square bg-[#1a1a1a] flex items-center justify-center cursor-pointer overflow-hidden",
            "border-2 border-[#404040] shadow-md", // Base state
            "hover:z-50 hover:animate-wiggle", 
            highQuality ? "hover:border-accent-gold" : "hover:border-white"
        )}
        style={{
            // Roughly rounded corners for hand-drawn feel, but boxy
            borderRadius: '4px 6px 3px 5px / 5px 3px 6px 4px'
        }}
    >
        {/* Background Radial Glow for rarity */}
        <div className={cn(
            "absolute inset-0 bg-radial-gradient opacity-0 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none",
            highQuality ? "from-accent-gold/50 to-transparent" : "from-white/20 to-transparent"
        )}></div>

        {/* Item Image */}
        <div className="relative z-10 p-4 transition-transform duration-200 group-hover:scale-110">
             {item.image ? (
                 <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-contain drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] rendering-pixelated"
                    loading="lazy"
                 />
             ) : (
                <div className="w-12 h-12 bg-white/10 rounded-full animate-pulse" />
             )}
        </div>

        {/* Tooltip Name (Appears on Hover) */}
        <div className="absolute inset-x-0 bottom-0 bg-black/80 p-1 translate-y-full group-hover:translate-y-0 transition-transform duration-200 flex flex-col items-center z-20">
            <span className={cn(
                "font-pixel text-xs text-center leading-tight tracking-wide",
                highQuality ? "text-accent-gold" : "text-white"
            )}>
                {item.name}
            </span>
            {item.description && (
                <span className="font-sans text-[10px] text-gray-400 text-center line-clamp-1 italic px-1">
                    {item.description}
                </span>
            )}
        </div>

    </motion.div>
  );
}
