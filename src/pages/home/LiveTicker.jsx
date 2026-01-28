import { useQuery } from '@tanstack/react-query';
import { fetchRandomItems } from '../../lib/api';
import { motion } from 'framer-motion';

export function LiveTicker() {
  const { data: items } = useQuery({
    queryKey: ['randomItems'],
    queryFn: () => fetchRandomItems(12),
    staleTime: 1000 * 60,
  });

  if (!items || items.length === 0) return null;

  // Duplicate items for seamless loop
  const duplicatedItems = [...items, ...items, ...items];

  return (
    <div className="w-full bg-bg-1 border-y border-white/5 py-4 overflow-hidden relative group">
       <div className="absolute inset-0 bg-bg-1 opacity-50 z-10 pointer-events-none group-hover:opacity-0 transition-opacity duration-500" />
       
       <motion.div 
         className="flex gap-12 w-fit px-4"
         animate={{ x: [0, -1000] }} // Adjust logic for exact variable width later or use percentages if consistent
         transition={{ 
            repeat: Infinity, 
            ease: "linear", 
            duration: 30 
         }}
       >
         {duplicatedItems.map((item, i) => (
           <div key={`${item.id}-${i}`} className="flex items-center gap-4 min-w-[250px] opacity-60 hover:opacity-100 transition-opacity cursor-default">
              <div className="w-10 h-10 bg-black/40 rounded border border-white/10 flex items-center justify-center p-1">
                 {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                 ) : (
                    <div className="w-full h-full bg-white/5" />
                 )}
              </div>
              <div>
                <p className="text-sm font-bold text-fg truncate">{item.name}</p>
                <p className="text-xs text-muted truncate max-w-[150px]">{item.item_type || 'Passive'}</p>
              </div>
           </div>
         ))}
       </motion.div>
    </div>
  );
}
