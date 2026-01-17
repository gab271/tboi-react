import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchItems } from '../../lib/api';
import { Input } from '../../components/ui/Input';
import { FaSearch, FaChevronLeft, FaChevronRight, FaFilter, FaTimes } from 'react-icons/fa';
import { ItemGridCard } from '../../features/items/components/ItemGridCard';
import { ItemsSidebar } from '../../features/items/components/ItemsSidebar';
import { ItemModal } from '../../features/items/components/ItemModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../components/ui/Button';

// Simple hook for debounce to avoid too many API calls
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

export function ItemsList() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState({ type: 'all' });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const debouncedSearch = useDebouncedValue(search, 500);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, activeFilters]);

  // Data Fetching
  const { data, isLoading, isError } = useQuery({
      queryKey: ['items', page, debouncedSearch, activeFilters.type],
      queryFn: () => fetchItems({ 
        page, 
        search: debouncedSearch, 
        type: activeFilters.type 
      }),
      placeholderData: (prev) => prev,
      staleTime: 5000 
  });
  
  // Extract data correctly handling { data: [...], meta: ... } format
  const responseData = data || {};
  const itemList = Array.isArray(responseData) ? responseData : (responseData.data || []);
  const meta = responseData.meta || {};

  const totalPages = meta.total ? Math.ceil(meta.total / meta.pageSize) : 0;
  // If api returns flat array (fallback), we likely can't paginate correctly without meta.
  
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
                className="text-4xl md:text-6xl font-serif font-black tracking-tighter mb-4"
            >
                THE <span className="text-blood">COLLECTION</span>
            </motion.h1>
            <p className="text-muted text-lg max-w-2xl mx-auto md:mx-0">
                Browse the complete catalog of artifacts found in the basement. 
                Discover their properties, interactions, and secrets.
            </p>
         </div>
      </section>

      <div className="container mx-auto max-w-7xl px-4 md:px-6 py-4 md:py-6 flex flex-col lg:flex-row gap-8">
        
        {/* 2. Sidebar Filters (Desktop) */}
        <ItemsSidebar activeFilters={activeFilters} setActiveFilters={setActiveFilters} />

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
                        <h2 className="font-serif font-bold text-xl">Filters</h2>
                        <Button variant="ghost" size="icon" onClick={() => setShowMobileFilters(false)}>
                            <FaTimes />
                        </Button>
                    </div>
                    {/* Reuse sidebar logic manual since Sidebar component is sticky/hidden */}
                    <div className="space-y-6">
                         <div>
                            <h3 className="text-xs font-bold uppercase text-muted mb-3">Item Type</h3>
                             <div className="flex flex-col gap-2">
                                {['all', 'passive', 'active', 'trinket', 'card'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => { setActiveFilters(prev => ({ ...prev, type })); setShowMobileFilters(false); }}
                                        className={`text-left px-3 py-2 rounded-lg text-sm capitalize ${activeFilters.type === type ? 'bg-blood/20 text-blood border border-blood/20' : 'bg-bg-0'}`}
                                    >
                                        {type}
                                    </button>
                                ))}
                             </div>
                         </div>
                    </div>
                </motion.div>
            </div>
        )}

        {/* 3. Main Content */}
        <main className="flex-1 min-h-[500px]">
             
             {/* Toolbar */}
             <div className="sticky top-[85px] z-30 bg-bg-0/95 backdrop-blur-md p-4 -mx-4 md:mx-0 md:rounded-xl border-y md:border border-white/5 mb-6 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="w-full md:w-96">
                       <Input 
                          icon={FaSearch}
                          placeholder="Search all items..." 
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="bg-bg-1 border-white/10"
                       />
                    </div>
                    
                    <div className="flex items-center justify-between md:justify-end gap-4">
                        <span className="text-sm text-muted hidden md:inline">
                           {isLoading ? 'Searching...' : `Found ${meta.total || itemList.length} results`}
                        </span>
                        
                        {/* Mobile Filter Toggle */}
                        <Button 
                            variant="outline" 
                            className="lg:hidden gap-2 border-white/10"
                            onClick={() => setShowMobileFilters(true)}
                        >
                            <FaFilter className="text-gold" /> Filter
                        </Button>
                    </div>
                </div>
             </div>

             {/* Dynamic Grid */}
             {isLoading ? (
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 animate-pulse">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="h-64 bg-bg-1 rounded-xl border border-white/5" />
                    ))}
                 </div>
             ) : isError ? (
                 <div className="text-center p-20 border border-red-500/20 rounded-xl bg-red-500/5">
                    <p className="text-red-400 font-bold">Failed to load items.</p>
                 </div>
             ) : (
                 <motion.div 
                    layout
                    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
                 >
                    <AnimatePresence mode='popLayout'>
                        {itemList.map((item, idx) => (
                            <ItemGridCard 
                                key={item.id} 
                                item={item} 
                                index={idx % 24} 
                                onClick={setSelectedItem} // Open Modal
                            />
                        ))}
                    </AnimatePresence>
                 </motion.div>
             )}

             {/* Empty State */}
             {!isLoading && itemList.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 opacity-50">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                        <FaSearch className="text-2xl" />
                    </div>
                    <p>No items found matching your criteria.</p>
                </div>
             )}

             {/* Pagination */}
             {totalPages > 1 && (
                 <div className="mt-12 flex justify-center items-center gap-6">
                    <button 
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="p-3 rounded-full hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    >
                        <FaChevronLeft />
                    </button>
                    
                    <span className="font-mono text-sm tracking-widest text-muted">
                        PAGE <span className="text-white font-bold">{page + 1}</span> / {totalPages}
                    </span>
                    
                    <button 
                      onClick={() => setPage(p => p + 1)}
                      disabled={page >= totalPages - 1} 
                      className="p-3 rounded-full hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    >
                        <FaChevronRight />
                    </button>
                 </div>
             )}

        </main>
      </div>
      
      {/* Detail Modal */}
      <AnimatePresence>
         {selectedItem && (
             <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />
         )}
      </AnimatePresence>

    </div>
  );
}
