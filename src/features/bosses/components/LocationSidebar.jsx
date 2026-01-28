import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { FaMapMarkerAlt } from 'react-icons/fa';

// Mock icons for floors
const FloorIcon = ({ name }) => (
    <div className="w-5 h-5 border-2 border-black/80 bg-gray-200 flex items-center justify-center text-[10px] font-mono shadow-[1px_1px_0_rgba(0,0,0,0.5)]">
        {name === 'all' ? '★' : name?.[0]}
    </div>
);

export function LocationSidebar({ activeFilters, setActiveFilters, locations = [] }) {
  const allLocations = locations.length > 0 ? locations : ['all', 'Basement', 'Caves', 'Depths', 'Womb', 'Sheol', 'Cathedral', 'Chest', 'Dark Room', 'Void'];

  return (
    <div className="hidden lg:flex flex-col w-64 sticky top-24 shrink-0 font-handwriting select-none">
       {/* Map Header Tape */}
       <div className="mx-auto w-24 h-6 bg-[#e0d8c3] opacity-80 rotate-1 shadow-sm mb-2 relative z-10 box-border border-l-2 border-r-2 border-white/20"></div>
       
       <div className="relative bg-[#fdfbf7] p-6 pb-12 shadow-[4px_4px_15px_rgba(0,0,0,0.1)] rotate-[-1deg] transition-transform hover:rotate-0">
          
          {/* Background Grid */}
          <div 
             className="absolute inset-0 pointer-events-none opacity-10"
             style={{
                 backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
                 backgroundSize: '20px 20px'
             }}
          ></div>
          
          {/* Torn Edge Bottom (CSS Clip Path) */}
          <div 
            className="absolute -bottom-2 left-0 right-0 h-4 bg-[#fdfbf7]"
            style={{
                clipPath: 'polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)'
            }}
          ></div>

          <h3 className="relative font-heading text-2xl text-[#2c2c2c] mb-6 flex items-center justify-center gap-2 border-b-2 border-black/20 pb-2">
             <FaMapMarkerAlt className="text-red-700" />
             FLOOR MAP
          </h3>

          <div className="space-y-3 relative z-10">
              {allLocations.map((loc) => {
                  const isActive = activeFilters.location === loc;
                  return (
                      <button
                         key={loc}
                         onClick={() => setActiveFilters(prev => ({ ...prev, location: loc }))}
                         className={cn(
                             "relative w-full text-left px-4 py-2 text-lg flex items-center gap-3 hover:pl-6 transition-all duration-200 indent-1",
                             isActive ? "font-bold text-black" : "text-gray-600"
                         )}
                      >
                         {/* Circle selection highlight */}
                         {isActive && (
                            <motion.div 
                                layoutId="map-selection"
                                className="absolute inset-0 border-2 border-red-600 rounded-full w-full h-full -rotate-1 skew-x-2"
                                style={{
                                    borderRadius: '50% 40% 60% 30% / 40% 50% 50% 60%' // Organic circle
                                }}
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                         )}
                         
                         {/* Floor Icon */}
                         <div className="relative z-10 shrink-0">
                            <FloorIcon name={loc} />
                         </div>
                         
                         <span className="relative z-10 uppercase tracking-wide truncate">
                            {loc === 'all' ? 'World' : loc}
                         </span>
                      </button>
                  );
              })}
          </div>

          {/* Compass Rose */}
          <div className="absolute bottom-6 right-6 opacity-20 rotate-12 pointer-events-none">
              <svg width="60" height="60" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="black" strokeWidth="2" fill="none" />
                  <path d="M50 10 L60 50 L90 50 L60 60 L70 90 L50 70 L30 90 L40 60 L10 50 L40 50 Z" fill="black" />
                  <text x="50" y="25" textAnchor="middle" fontSize="12" fontWeight="bold">N</text>
              </svg>
          </div>

       </div>
    </div>
  );
}
