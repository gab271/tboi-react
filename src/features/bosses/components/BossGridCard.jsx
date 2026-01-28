import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { FaSkull, FaHeart } from 'react-icons/fa';

export function BossGridCard({ boss, index, onClick }) {
  const rotation = (boss.name.length % 4) - 2;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ 
          scale: 1.05, 
          rotate: rotation * -1.5,
          zIndex: 10
      }}
      onClick={() => onClick(boss)}
      className={cn(
        "group relative flex flex-col items-center bg-[#fdfbf7] p-3 pb-6 cursor-pointer",
        "shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.2)]",
        "transition-all duration-300 ease-out",
        "border border-gray-200"
      )}
      style={{
          transform: `rotate(${rotation}deg)` 
      }}
    >
      {/* Visual Stain/Aging */}
      <div className="absolute top-10 right-2 w-16 h-16 bg-yellow-900/5 blur-2xl rounded-full pointer-events-none" />

      {/* Image Area */}
      <div className="w-full aspect-square bg-[#1a1a1a] shadow-inner flex items-center justify-center overflow-hidden border-4 border-white mb-3 relative group-hover:border-red-500/20 transition-colors">
         
         <div className="absolute inset-0 bg-red-900/10 opacity-0 group-hover:opacity-100 transition-opacity z-0" />

         {boss.image ? (
            <img src={boss.image} alt={boss.name} className="w-4/5 h-4/5 object-contain filter drop-shadow-xl relative z-10 group-hover:scale-110 transition-transform duration-500" loading="lazy" />
         ) : (
            <div className="text-white/20 text-3xl">
                <FaSkull />
            </div>
         )}
      </div>

      {/* Text Area */}
      <div className="text-center w-full z-10">
        <h3 className="font-heading text-lg text-text-heading mb-1 truncate group-hover:text-accent-blood transition-colors">
            {boss.name}
        </h3>
        
        <div className="flex items-center justify-center gap-3 text-sm font-handwriting text-text-dim">
            <span className="flex items-center gap-1">
                <FaHeart className="text-accent-blood text-xs" /> {boss.health || '??'}
            </span>
             
             {boss.location && (
                 <span className="capitalize">
                    ({boss.location})
                 </span>
             )}
        </div>
      </div>
    </motion.div>
  );
}
