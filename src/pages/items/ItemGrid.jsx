import { ItemCard } from './ItemCard';
import { cn } from '../../lib/utils';

export function ItemGrid({ items, isLoading }) {
  
  // Custom Loading State (Empty Slots)
  if (isLoading) {
    return (
        <div className="relative bg-[#0a0a0a]/95 p-6 rounded-sm shadow-xl border-2 border-black/80"
             style={{
                borderRadius: '3px 5px 2px 4px', // Irregular block
             }}
        >
             <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
                {[...Array(20)].map((_, i) => (
                    <div key={i} className="aspect-square bg-black/20 border border-white/20 flex items-center justify-center rounded-[2px]">
                        <span className="font-pixel text-white/10 text-xl animate-pulse">?</span>
                    </div>
                ))}
             </div>
        </div>
    );
  }

  if (!items || items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-12 bg-[#0a0a0a]/90 text-white min-h-[400px] rounded-[3px] border-2 border-dashed border-white/10">
            <span className="text-4xl mb-4 opacity-50">🕸️</span>
            <p className="font-pixel text-white/70 text-xl text-center tracking-widest">NO ITEMS FOUND</p>
        </div>
      );
  }

  return (
    // The Dark "Embedded" Block Container - Softened
    <div className={cn(
            "relative bg-[#0a0a0a] p-4 md:p-6 lg:p-8",
            "shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]" // Deep inset shadow
         )}
         style={{
             // Irregular border radius for non-perfect rect
             borderRadius: '2px 4px 1px 3px',
             // Minimal messy border matching the paper aesthetic but inverted
             border: '2px solid rgba(40,40,40, 1)' 
         }}
    >
      {/* Subtle Texture Overlay for the "Sticker Sheet" look */}
      <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none"></div>

      {/* Decorative rivets (darkened) */}
      <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-[#333] opacity-50"></div>
      <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#333] opacity-50"></div>
      <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-[#333] opacity-50"></div>
      <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-[#333] opacity-50"></div>

      {/* The Grid itself has gaps that reveal the dark background */}
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3 relative z-10">
        {items.map((item, index) => (
          <ItemCard key={item.id || index} item={item} index={index} />
        ))}
      </div>
    </div>
  );
}
