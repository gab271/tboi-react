import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchBosses } from '../../lib/api';
import { Input } from '../../components/ui/Input';
import { FaSearch, FaSkull, FaFilter, FaTimes } from 'react-icons/fa';
import { BossCard } from '../../features/bosses/components/BossCard';
import { LocationSidebar } from '../../features/bosses/components/LocationSidebar';
import { BossModal } from '../../features/bosses/components/BossModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../components/ui/Button';

// Simple debounce (reused)
function useDebouncedValue(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export function BossesList() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState({ location: 'all' });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedBoss, setSelectedBoss] = useState(null);

  const debouncedSearch = useDebouncedValue(search, 500);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, activeFilters]);

  // Data Fetching
  const { data, isLoading } = useQuery({
      queryKey: ['bosses', page, debouncedSearch, activeFilters.location],
      queryFn: () => fetchBosses({ 
        page, 
        search: debouncedSearch, 
        location: activeFilters.location 
      }),
      placeholderData: (prev) => prev,
      staleTime: 5000 
  });
  
  const responseData = data || {};
  const bossList = Array.isArray(responseData) ? responseData : (responseData.data || []);
  const meta = responseData.meta || {};

  const totalPages = meta.total ? Math.ceil(meta.total / meta.pageSize) : 0;

  return (
    <div className="min-h-full p-4 md:p-8 relative">
      
      {/* Header: "BOUNTY BOARD" */}
      <section className="mb-12 text-center relative z-20">
         <div className="inline-block relative">
             <div className="absolute inset-0 bg-black/80 blur-xl transform scale-110 rounded-full"></div>
             <h1 className="relative font-heading text-6xl md:text-8xl text-[#d4c5a9] tracking-widest drop-shadow-[4px_4px_0_#000] rotate-[-2deg] border-b-8 border-double border-[#8b0000] pb-2">
                 THE BOUNTY BOARD
             </h1>
             {/* Nails/Bolts */}
             <div className="absolute -top-4 -left-8 w-6 h-6 rounded-full bg-[#1a1a1a] border-2 border-[#555] shadow-lg"></div>
             <div className="absolute -top-4 -right-8 w-6 h-6 rounded-full bg-[#1a1a1a] border-2 border-[#555] shadow-lg"></div>
         </div>
         <p className="mt-4 font-handwriting text-2xl text-[#f4e4bc] drop-shadow-md opacity-80 rotate-1">
             Wanted Dead (preferably) or Alive
         </p>
      </section>

      <div className="flex flex-col lg:flex-row gap-12 relative z-10">
        
        {/* Sidebar: Map (Paper Style) */}
        <LocationSidebar 
            activeFilters={activeFilters} 
            setActiveFilters={setActiveFilters} 
        />

        {/* Mobile Filter Toggle */}
         <div className="lg:hidden flex justify-between items-center mb-6">
            <Button 
                onClick={() => setShowMobileFilters(true)}
                className="flex items-center gap-2 font-handwriting font-bold text-xl border-2 border-[#4a2c10] bg-[#f4e4bc] text-black shadow-[4px_4px_0_rgba(0,0,0,0.5)] active:translate-y-1 active:shadow-none"
            >
                <FaFilter /> Map / Locations
            </Button>
        </div>

        {/* Mobile Filter Drawer */}
        <AnimatePresence>
            {showMobileFilters && (
                <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
                    <motion.div 
                         initial={{ opacity: 0 }} 
                         animate={{ opacity: 1 }} 
                         exit={{ opacity: 0 }}
                         className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
                         onClick={() => setShowMobileFilters(false)} 
                    />
                    
                    <motion.div 
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: "spring", damping: 20 }}
                        className="relative w-80 h-full overflow-y-auto"
                    >
                        <LocationSidebar 
                            activeFilters={activeFilters} 
                            setActiveFilters={setActiveFilters} 
                        />
                         <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setShowMobileFilters(false)}
                            className="absolute top-4 right-4 z-50 text-black hover:text-red-600"
                        >
                            <FaTimes className="w-6 h-6" />
                        </Button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>

        {/* Main Content: The Board */}
        <main className="flex-1 min-w-0">
             
             {/* Search Input (Paper Strip) */}
            <div className="mb-10 max-w-xl mx-auto lg:mx-0 relative group">
                <div className="absolute inset-0 bg-white/80 rotate-1 blur-sm rounded-sm group-focus-within:rotate-0 transition-transform"></div>
                <div className="relative flex items-center bg-[#fdfbf7] border-2 border-black/60 p-1 shadow-[2px_2px_10px_rgba(0,0,0,0.2)] transform -rotate-1 group-focus-within:rotate-0 transition-transform duration-300">
                    <FaSearch className="ml-3 text-gray-500 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Find target..." 
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full bg-transparent text-black font-handwriting text-2xl px-3 py-2 focus:outline-none placeholder:text-gray-400 uppercase"
                    />
                </div>
                {/* Tape */}
                <div className="absolute -top-3 left-10 w-12 h-6 bg-[#e0d8c3] opacity-90 rotate-[-5deg] shadow-sm"></div>
            </div>

            {/* Grid of Wanted Posters */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                   <div className="animate-spin text-4xl text-[#f4e4bc]">
                      <FaSkull />
                   </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16 px-4 pb-20 perspective-[1000px]">
                    <AnimatePresence mode="popLayout">
                        {bossList.map((boss, index) => (
                           <BossCard 
                              key={boss.id || boss.name} 
                              boss={boss} 
                              index={index} 
                              onClick={setSelectedBoss} 
                           />
                        ))}
                    </AnimatePresence>
                    
                    {bossList.length === 0 && (
                        <div className="col-span-full text-center py-20">
                            <h3 className="font-heading text-4xl text-[#f4e4bc]/50">No bounties found.</h3>
                        </div>
                    )}
                </div>
            )}
             
             {/* Pagination */}
             {totalPages > 1 && (
                 <div className="flex justify-center gap-8 mt-4 text-[#f4e4bc] font-heading text-2xl">
                     <button 
                        disabled={page === 0}
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        className="disabled:opacity-30 hover:text-white hover:scale-110 transition-all uppercase"
                     >
                        &lt; Prev
                     </button>
                     <span>{page + 1}</span>
                     <button 
                        disabled={!meta.hasMore && bossList.length < (meta.pageSize || 20)}
                        onClick={() => setPage(p => p + 1)}
                        className="disabled:opacity-30 hover:text-white hover:scale-110 transition-all uppercase"
                     >
                        Next &gt;
                     </button>
                 </div>
             )}
        </main>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedBoss && (
          <BossModal 
            boss={selectedBoss} 
            onClose={() => setSelectedBoss(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
