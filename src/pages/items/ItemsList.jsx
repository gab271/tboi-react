import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchItems } from '../../lib/api';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import { FilterSidebar } from './FilterSidebar'; // The new Sidebar
import { ItemGrid } from './ItemGrid'; // The new Grid
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

  const debouncedSearch = useDebouncedValue(search, 500);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, activeFilters]);

  // Data Fetching
  const { data, isLoading } = useQuery({
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
  
  return (
    <div className="min-h-full bg-transparent text-text-ink p-4 md:p-0">
      
      {/* 1. Header Section - Sketchy Title */}
      <section className="relative pt-4 pb-8 md:pt-6 md:pb-12 text-center md:text-left">
         <div className="flex flex-col md:flex-row items-end gap-4 mb-4 border-b-4 border-black border-dashed pb-4 w-full">
            <h1 className="text-5xl md:text-7xl font-heading tracking-tighter text-black drop-shadow-sm leading-none">
                THE COLLECTION
            </h1>
            <span className="font-handwriting text-2xl text-accent-blood font-bold rotate-[-2deg] mb-2">
                (Wiki Draft)
            </span>
         </div>
      </section>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative">
        
        {/* 2. Sidebar Filters (Desktop) - Sticky Note Style */}
        <div className="hidden lg:block w-72 flex-shrink-0">
             <FilterSidebar activeFilters={activeFilters} setActiveFilters={setActiveFilters} />
        </div>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex justify-between items-center mb-4">
            <Button 
                onClick={() => setShowMobileFilters(true)}
                className="flex items-center gap-2 font-handwriting font-bold text-xl border-2 border-black bg-white shadow-[4px_4px_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
            >
                <FaFilter /> Filters
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
                        <FilterSidebar 
                            activeFilters={activeFilters} 
                            setActiveFilters={setActiveFilters} 
                            className="h-full min-h-screen" 
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

        {/* 3. Main Content - Grid Embedded in Dark Block */}
        <main className="flex-1 w-full min-w-0">
             
             {/* Search Bar - Hand Drawn Input */}
             <div className="mb-8 relative z-30 max-w-2xl">
                <div className="relative transform rotate-1 transition-transform focus-within:rotate-0">
                   <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                   <input
                      type="text"
                      placeholder="Search artifacts..." 
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full bg-[#111] text-white font-pixel text-xl pl-12 pr-4 py-4 border-2 border-[#444] shadow-[4px_4px_0_rgba(0,0,0,0.5)] focus:outline-none focus:border-white focus:shadow-[2px_2px_0_rgba(0,0,0,1)] transition-all placeholder:text-gray-600"
                      style={{
                          borderRadius: '2px'
                      }}
                   />
                   {/* Tape on search bar */}
                   <div className="absolute -top-3 -right-2 w-16 h-8 bg-[#e8e4d9] opacity-90 rotate-12 shadow-sm border border-black/10 pointer-events-none"></div>
                </div>
                
                <div className="mt-2 text-right">
                    <span className="text-sm font-handwriting font-bold text-black/50">
                       {isLoading ? 'Searching...' : `Found ${meta.total || itemList.length} items`}
                    </span>
                </div>
             </div>

             <ItemGrid items={itemList} isLoading={isLoading} />
             
             {/* Pagination */}
             <div className="mt-8 flex justify-center gap-4">
                 <Button 
                    variant="outline" 
                    disabled={page === 0} 
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    className="font-pixel border-2 border-black disabled:opacity-30 hover:bg-black hover:text-white transition-colors"
                 >
                     PREV
                 </Button>
                 <div className="font-pixel text-2xl flex items-center px-4 bg-white border-2 border-black shadow-[2px_2px_0_#000]">
                    {page + 1}
                 </div>
                 <Button 
                    variant="outline" 
                    disabled={!meta.hasMore && itemList.length < (meta.pageSize || 20)} 
                    onClick={() => setPage(p => p + 1)}
                    className="font-pixel border-2 border-black disabled:opacity-30 hover:bg-black hover:text-white transition-colors"
                 >
                     NEXT
                 </Button>
             </div>
        </main>
      </div>
    </div>
  );
}
