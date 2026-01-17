import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchBosses } from '../../lib/api';
import { Input } from '../../components/ui/Input';
import { FaSearch, FaSkull, FaFilter } from 'react-icons/fa';
import { BossGridCard } from '../../features/bosses/components/BossGridCard';
import { BossesSidebar } from '../../features/bosses/components/BossesSidebar';
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

  return (
    <div className="min-h-screen bg-bg-0 text-fg">
      
      {/* 1. Header Section */}
      <section className="relative pt-8 pb-10 md:pt-12 md:pb-12 px-6 border-b border-white/5 overflow-hidden">
         <div className="absolute inset-0 bg-bg-1/50 z-0" />
         <div className="absolute -top-20 -right-20 w-96 h-96 bg-blood/10 rounded-full blur-[100px]" />
         
         <div className="relative z-10 container mx-auto max-w-7xl text-center md:text-left">
            <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-6xl font-serif font-black tracking-tighter mb-4 flex items-center justify-center md:justify-start gap-4"
            >
                <FaSkull className="text-blood" /> THE BOSSES
            </motion.h1>
            <p className="text-muted text-lg max-w-2xl mx-auto md:mx-0">
                Formidable foes found in the basement and beyond.
                Prepare yourself before entering the boss room.
            </p>
         </div>
      </section>

      <div className="container mx-auto max-w-7xl px-4 md:px-6 py-4 md:py-6 flex flex-col lg:flex-row gap-8">
        
        {/* 2. Sidebar Filters (Desktop) */}
        <BossesSidebar activeFilters={activeFilters} setActiveFilters={setActiveFilters} />

        {/* Mobile Filter Drawer */}
        {showMobileFilters && (
            <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
                
                {/* Content */}
                <motion.div 
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    className="relative w-80 h-full bg-bg-1 border-l border-white/10 p-6 shadow-2xl overflow-y-auto"
                > 
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-serif font-bold">Filters</h2>
                        <Button size="icon" variant="ghost" onClick={() => setShowMobileFilters(false)}>
                            <FaFilter />
                        </Button>
                    </div>
                     <BossesSidebar activeFilters={activeFilters} setActiveFilters={setActiveFilters} />
                </motion.div>
            </div>
        )}

        {/* 3. Main Content */}
        <div className="flex-1">
            {/* Search Bar & Mobile Filter Trigger */}
            <div className="sticky top-20 z-30 bg-bg-0/95 backdrop-blur-lg border border-white/5 rounded-xl p-2 mb-6 shadow-xl flex gap-2">
                <div className="relative flex-1">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                        placeholder="Search bosses..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 bg-transparent border-none focus:ring-0 w-full h-10"
                    />
                </div>
                <Button 
                    className="lg:hidden shrink-0" 
                    variant="outline" 
                    onClick={() => setShowMobileFilters(true)}
                >
                    <FaFilter />
                </Button>
            </div>

            {/* Bosses Grid */}
            {isLoading ? (
               <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[...Array(12)].map((_, i) => (
                      <div key={i} className="h-64 bg-bg-1 rounded-xl animate-pulse" />
                  ))}
               </div>
            ) : bossList.length > 0 ? (
               <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  <AnimatePresence mode="popLayout">
                    {bossList.map((boss, index) => (
                        <BossGridCard 
                            key={boss.id} 
                            boss={boss} 
                            index={index}
                            onClick={setSelectedBoss}
                        />
                    ))}
                  </AnimatePresence>
               </div>
            ) : (
                <div className="py-20 text-center border border-dashed border-border rounded-lg bg-bg-1/50">
                    <FaSkull className="text-4xl text-muted/20 mx-auto mb-4" />
                    <p className="text-muted text-lg">No bosses found matching your criteria.</p>
                </div>
            )}
            
            {/* Pagination Controls could be added here if needed, but infinite scroll or Load More is often better */}
        </div>

      </div>

      {/* Detail Modal */}
      <AnimatePresence>
          {selectedBoss && (
              <BossModal boss={selectedBoss} onClose={() => setSelectedBoss(null)} />
          )}
      </AnimatePresence>

    </div>
  );
}
