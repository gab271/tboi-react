import { Checkbox } from '../../components/ui/Checkbox';
import { cn } from '../../lib/utils';

export function FilterSidebar({ activeFilters, setActiveFilters, className }) {
  const toggleFilter = (type) => {
    setActiveFilters(prev => ({ ...prev, type: prev.type === type ? 'all' : type }));
  };

  const toggleQuality = (quality) => {
    setActiveFilters(prev => {
      const currentQualities = prev.quality || [];
      const isActive = currentQualities.includes(quality);
      
      return {
        ...prev,
        quality: isActive 
          ? currentQualities.filter(q => q !== quality)
          : [...currentQualities, quality]
      };
    });
  };

  const types = ['passive', 'active', 'trinket', 'card', 'pill', 'rune'];
  const qualities = [
    { value: 4, label: 'Quality 4', emoji: '⭐⭐⭐⭐', color: 'text-yellow-400' },
    { value: 3, label: 'Quality 3', emoji: '⭐⭐⭐', color: 'text-orange-400' },
    { value: 2, label: 'Quality 2', emoji: '⭐⭐', color: 'text-blue-400' },
    { value: 1, label: 'Quality 1', emoji: '⭐', color: 'text-gray-400' },
    { value: 0, label: 'Quality 0', emoji: '💀', color: 'text-red-600' }
  ];

  return (
    <aside className={cn("relative w-full md:w-64 flex-shrink-0 z-20", className)}>
        {/* The Paper Sheet Container */}
        <div 
            className="relative bg-[#f4f1ea] p-6 min-h-[400px] md:sticky md:top-24 transform md:-rotate-1 transition-transform duration-500 ease-out"
            style={{
                boxShadow: '2px 4px 15px rgba(0,0,0,0.2)', // Deep drop shadow
                // Ragged edge visual - using rough clip-path for left/right/bottom, top is taped
                clipPath: 'polygon(0% 0%, 100% 1%, 98% 100%, 2% 99%)', 
                // Alternatively could use complex polygon for torn bottom edge
            }}
        >
             {/* Paper Texture Overlay */}
             <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none mix-blend-multiply"></div>
             
             {/* "Tape" holding it up */}
             <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-8 bg-white/40 shadow-sm transform rotate-1 backdrop-blur-sm z-10 border-l border-r border-white/60"></div>

             {/* Content */}
             <div className="relative z-10">
                <h3 className="font-heading text-2xl text-black uppercase tracking-wider mb-6 pb-2 border-b-2 border-black/80 border-dashed transform -rotate-1">
                    Filters
                </h3>

                <div className="space-y-6">
                    {/* Filter Group: Type */}
                    <div>
                        <h4 className="font-handwriting text-lg font-bold text-black/60 mb-3 underline decoration-wavy decoration-accent-blood/30">
                            Item Type
                        </h4>
                        <div className="flex flex-col gap-2 pl-2">
                             <Checkbox 
                                label="All Items" 
                                checked={activeFilters.type === 'all'} 
                                onChange={() => toggleFilter('all')}
                             />
                             {types.map(type => (
                                 <Checkbox 
                                    key={type}
                                    label={type.charAt(0).toUpperCase() + type.slice(1)}
                                    checked={activeFilters.type === type}
                                    onChange={() => toggleFilter(type)}
                                 />
                             ))}
                        </div>
                    </div>

                    {/* Quality Filter - NOW FUNCTIONAL */}
                    <div>
                        <h4 className="font-handwriting text-lg font-bold text-black/60 mb-3 underline decoration-wavy decoration-accent-blood/30">
                           Quality Tier
                        </h4>
                        <div className="flex flex-col gap-2 pl-2">
                             {qualities.map(({ value, label, emoji, color }) => (
                                 <Checkbox 
                                    key={value}
                                    label={
                                        <span className="flex items-center gap-2">
                                            <span className={color}>{emoji}</span>
                                            <span>{label}</span>
                                        </span>
                                    }
                                    checked={(activeFilters.quality || []).includes(value)}
                                    onChange={() => toggleQuality(value)}
                                 />
                             ))}
                        </div>
                    </div>
                </div>

                {/* Hand Drawn Doodle */}
                <svg className="absolute bottom-4 right-4 w-16 h-16 text-black/20 transform rotate-12 pointer-events-none" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5 5" />
                    <path d="M 30 40 Q 50 60 70 40" stroke="currentColor" strokeWidth="2" fill="none" />
                    <circle cx="35" cy="35" r="5" fill="currentColor" />
                    <circle cx="65" cy="35" r="5" fill="currentColor" />
                </svg>
             </div>
        </div>
    </aside>
  );
}
