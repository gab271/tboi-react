import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt } from 'react-icons/fa';
import api from '../../../lib/api';

export function BossesSidebar({ activeFilters, setActiveFilters }) {
  // Hardcoded locations or fetch them? Fetching is better dynamic.
  const [locations, setLocations] = useState(['all']);

  useEffect(() => {
      // Fetch available locations from API
      // We'll trust backend to provide /api/bosses/locations
      // Or for now we can rely on static list
      const fetchLocs = async () => {
          try {
              const { data } = await api.get('/api/bosses/locations');
              // data should be an array of strings
              if (Array.isArray(data)) {
                  setLocations(['all', ...data]);
              }
          } catch {
              // fallback
              setLocations(['all', 'Basement', 'Caves', 'Depths', 'Womb', 'Sheol', 'Cathedral', 'Chest', 'Dark Room', 'Void']);
          }
      };
      
      fetchLocs();
  }, []);

  return (
    <motion.aside 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:block w-64 shrink-0 space-y-8 sticky top-[100px] h-fit"
    >
        {/* Category: Location */}
        <div className="bg-bg-1 border border-white/5 rounded-2xl p-6">
            <h3 className="text-xs font-bold uppercase text-muted mb-4 tracking-widest flex items-center gap-2">
                <FaMapMarkerAlt /> Location
            </h3>
            <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {locations.map(loc => (
                    <button
                        key={loc}
                        onClick={() => setActiveFilters(prev => ({ ...prev, location: loc }))}
                        className={`
                            text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between group
                            ${activeFilters.location === loc 
                                ? 'bg-blood/20 text-blood font-semibold border border-blood/20' 
                                : 'text-muted-foreground hover:bg-white/5 hover:text-fg'
                            }
                        `}
                    >
                        <span className="capitalize">{loc}</span>
                        {activeFilters.location === loc && (
                            <motion.div layoutId="active-dot-boss" className="w-1.5 h-1.5 rounded-full bg-blood" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    </motion.aside>
  );
}
