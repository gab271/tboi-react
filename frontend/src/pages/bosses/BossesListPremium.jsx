import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { fetchBosses } from '../../lib/api';
import { FaSearch, FaSkull, FaFilter, FaTimes, FaArrowLeft, FaArrowRight, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';

// Premium Bounty Board Components
import { BossProgressProvider } from '../../features/bosses/context/BossProgressContext';
import { 
  BossCardEnhanced,
  BossDetailModal,
  ProgressHeader,
  FloorProgressSidebar,
  AdvancedFilterBar,
  useFilteredBosses,
  ProUpsellBanner
} from '../../features/bosses/components';
import { useSoundEffects } from '../../features/bosses/hooks/useAnimations';

// Debounce hook
function useDebouncedValue(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

/**
 * Hero header component with reduced height (25% less)
 */
function BountyBoardHeader() {
  const { t } = useTranslation();
  
  return (
    <section className="mb-6 md:mb-8 text-center relative z-20 px-4 py-4 md:py-6">
      <div className="inline-block relative max-w-full">
        {/* Glow background */}
        <div className="absolute inset-0 bg-black/80 blur-xl transform scale-110 rounded-full" />
        
        {/* Title */}
        <h1 className="relative font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#d4c5a9] tracking-widest drop-shadow-[4px_4px_0_#000] rotate-[-2deg] border-b-4 md:border-b-6 border-double border-[#8b0000] pb-2 break-words">
          THE BOUNTY BOARD
        </h1>
        
        {/* Nails */}
        <div className="absolute -top-3 -left-3 md:-left-6 w-3 h-3 md:w-5 md:h-5 rounded-full bg-[#1a1a1a] border-2 border-[#555] shadow-lg" />
        <div className="absolute -top-3 -right-3 md:-right-6 w-3 h-3 md:w-5 md:h-5 rounded-full bg-[#1a1a1a] border-2 border-[#555] shadow-lg" />
      </div>
      
      <p className="mt-3 font-handwriting text-base md:text-xl text-[#f4e4bc] drop-shadow-md opacity-80 rotate-1">
        {t('bosses.subtitle', 'Wanted Dead (preferably) or Alive')}
      </p>
    </section>
  );
}

/**
 * Search input with paper strip style
 */
function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className="relative group max-w-xl">
      {/* Background paper */}
      <div className="absolute inset-0 bg-white/80 rotate-1 blur-sm rounded-sm group-focus-within:rotate-0 transition-transform" />
      
      {/* Input container */}
      <div className="relative flex items-center bg-[#fdfbf7] border-2 border-black/60 p-1 shadow-[2px_2px_10px_rgba(0,0,0,0.2)] transform -rotate-1 group-focus-within:rotate-0 transition-transform duration-300">
        <FaSearch className="ml-3 text-gray-500 w-5 h-5" />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-black font-handwriting text-xl px-3 py-2 focus:outline-none placeholder:text-gray-400 uppercase"
        />
      </div>
      
      {/* Tape decoration */}
      <div className="absolute -top-2 left-8 w-10 h-5 bg-[#e0d8c3] opacity-90 rotate-[-5deg] shadow-sm" />
    </div>
  );
}

/**
 * Mobile filter drawer trigger and content
 */
function MobileFilterDrawer({ 
  isOpen, 
  onClose, 
  filters, 
  setFilters, 
  sortBy, 
  setSortBy,
  activeFloor,
  setActiveFloor,
  bossList
}) {
  const { t } = useTranslation();
  
  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
              onClick={onClose} 
            />
            
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 20 }}
              className="absolute right-0 top-0 h-full w-80 max-w-[90vw] bg-[#fdfbf7] shadow-2xl overflow-y-auto"
            >
              {/* Close button */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose}
                className="absolute top-4 right-4 z-50 text-black hover:text-red-600"
              >
                <FaTimes className="w-6 h-6" />
              </Button>
              
              <div className="p-6 pt-16">
                <h3 className="font-heading text-2xl text-[#2a1a10] mb-6">
                  {t('bosses.filtersAndMap', 'Filters & Map')}
                </h3>
                
                {/* Filters */}
                <div className="mb-8">
                  <AdvancedFilterBar 
                    filters={filters}
                    setFilters={setFilters}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                  />
                </div>
                
                {/* Floor Progress */}
                <FloorProgressSidebar
                  activeFloor={activeFloor}
                  setActiveFloor={setActiveFloor}
                  bossList={bossList}
                  className="!hidden lg:!flex"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Pagination component
 */
function Pagination({ page, totalPages, onPageChange }) {
  const { t } = useTranslation();
  
  if (totalPages <= 1) return null;
  
  return (
    <div className="flex justify-center items-center gap-8 mt-8 mb-4 font-heading text-2xl">
      <button 
        disabled={page === 0}
        onClick={() => onPageChange(Math.max(0, page - 1))}
        className="flex items-center gap-2 text-[#8b0000] disabled:opacity-30 hover:scale-110 transition-all uppercase drop-shadow-sm"
      >
        <FaArrowLeft className="w-5 h-5" /> 
        <span className="hidden sm:inline">{t('common.prev', 'Prev')}</span>
      </button>
      
      <span className="text-[#2a1a10] bg-[#f4e4bc] px-4 py-2 border-2 border-[#8b0000] rotate-2 shadow-sm rounded-sm">
        {page + 1} / {totalPages}
      </span>
      
      <button 
        disabled={page >= totalPages - 1}
        onClick={() => onPageChange(page + 1)}
        className="flex items-center gap-2 text-[#8b0000] disabled:opacity-30 hover:scale-110 transition-all uppercase drop-shadow-sm"
      >
        <span className="hidden sm:inline">{t('common.nextShort', 'Next')}</span> 
        <FaArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}

/**
 * Main Bounty Board Page Component
 * Premium Companion App for Boss Tracking
 */
function BossesListContent() {
  const { t } = useTranslation();
  
  // State
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: 'all', floor: 'all' });
  const [sortBy, setSortBy] = useState('default');
  const [activeFloor, setActiveFloor] = useState('all');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedBoss, setSelectedBoss] = useState(null);
  
  const debouncedSearch = useDebouncedValue(search, 500);
  
  // Sound effects
  const { soundEnabled, toggleSound } = useSoundEffects();
  
  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, filters, sortBy, activeFloor]);

  // Data Fetching
  const { data, isLoading } = useQuery({
    queryKey: ['bosses', page, debouncedSearch, activeFloor],
    queryFn: () => fetchBosses({ 
      page, 
      search: debouncedSearch, 
      location: activeFloor !== 'all' ? activeFloor : undefined
    }),
    placeholderData: (prev) => prev,
    staleTime: 5000 
  });
  
  const responseData = data || {};
  const bossList = Array.isArray(responseData) ? responseData : (responseData.data || []);
  const meta = responseData.meta || {};
  const totalPages = meta.total ? Math.ceil(meta.total / (meta.pageSize || 24)) : 1;

  // Apply client-side filtering and sorting
  const filteredBosses = useFilteredBosses(bossList, filters, sortBy);

  return (
    <div className="min-h-full p-4 md:p-6 relative">
      {/* Header */}
      <BountyBoardHeader />
      
      {/* Progress Header (User's hunting progress) */}
      <div className="max-w-4xl mx-auto mb-6">
        <ProgressHeader bossList={bossList} />
      </div>
      
      {/* Sound toggle */}
      <button
        onClick={toggleSound}
        className="fixed bottom-4 right-4 z-40 w-10 h-10 bg-[#4a2c10] text-[#f4e4bc] rounded-full flex items-center justify-center shadow-lg hover:bg-[#2a1a10] transition-colors"
        title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
      >
        {soundEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
      </button>

      <div className="flex flex-col lg:flex-row gap-6 md:gap-8 relative z-10">
        
        {/* Sidebar: Floor Progress Map - Desktop */}
        <FloorProgressSidebar 
          activeFloor={activeFloor}
          setActiveFloor={setActiveFloor}
          bossList={bossList}
        />

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex flex-col sm:flex-row gap-3 mb-4">
          <Button 
            onClick={() => setShowMobileFilters(true)}
            className="flex-1 flex items-center justify-center gap-2 font-handwriting font-bold text-lg border-2 border-[#4a2c10] bg-[#f4e4bc] text-black shadow-[3px_3px_0_rgba(0,0,0,0.4)] active:translate-y-0.5 active:shadow-[1px_1px_0_rgba(0,0,0,0.4)] py-3"
          >
            <FaFilter /> {t('bosses.filtersMap', 'Filters & Map')}
          </Button>
        </div>

        {/* Mobile Filter Drawer */}
        <MobileFilterDrawer 
          isOpen={showMobileFilters}
          onClose={() => setShowMobileFilters(false)}
          filters={filters}
          setFilters={setFilters}
          sortBy={sortBy}
          setSortBy={setSortBy}
          activeFloor={activeFloor}
          setActiveFloor={setActiveFloor}
          bossList={bossList}
        />

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          
          {/* Search & Filters Row */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <SearchInput 
                value={search}
                onChange={setSearch}
                placeholder={t('bosses.searchPlaceholder', 'Hunt for a target...')}
              />
            </div>
            
            {/* Desktop Filters */}
            <div className="hidden lg:block">
              <AdvancedFilterBar 
                filters={filters}
                setFilters={setFilters}
                sortBy={sortBy}
                setSortBy={setSortBy}
              />
            </div>
          </div>

          {/* Boss Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="text-4xl text-[#f4e4bc]"
              >
                <FaSkull />
              </motion.div>
            </div>
          ) : (
            <>
              {/* Results count */}
              {filteredBosses.length > 0 && (
                <p className="font-handwriting text-sm text-[#f4e4bc]/60 mb-4">
                  {t('bosses.showingResults', 'Showing {{count}} bounties', { count: filteredBosses.length })}
                </p>
              )}
              
              {/* Grid - 4 cols desktop, 2 tablet, 1 mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6 pb-16">
                <AnimatePresence mode="popLayout">
                  {filteredBosses.map((boss, index) => (
                    <BossCardEnhanced 
                      key={boss.id || boss.name} 
                      boss={boss} 
                      index={index} 
                      onClick={setSelectedBoss} 
                    />
                  ))}
                </AnimatePresence>
                
                {filteredBosses.length === 0 && (
                  <motion.div 
                    className="col-span-full text-center py-16"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <FaSkull className="w-16 h-16 mx-auto mb-4 text-[#f4e4bc]/20" />
                    <h3 className="font-heading text-2xl md:text-3xl text-[#f4e4bc]/50">
                      {t('bosses.noBossesFound', 'No bounties match your hunt')}
                    </h3>
                    <p className="font-handwriting text-lg text-[#f4e4bc]/30 mt-2">
                      {t('bosses.tryDifferentFilters', 'Try different filters or search terms')}
                    </p>
                  </motion.div>
                )}
              </div>
              
              {/* Pagination */}
              <Pagination 
                page={page} 
                totalPages={totalPages} 
                onPageChange={setPage} 
              />
            </>
          )}
          
          {/* PRO Upsell Banner */}
          <ProUpsellBanner className="mt-8" />
        </main>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedBoss && (
          <BossDetailModal 
            boss={selectedBoss} 
            onClose={() => setSelectedBoss(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Wrapped component with BossProgressProvider
 */
export function BossesListPremium() {
  return (
    <BossProgressProvider>
      <BossesListContent />
    </BossProgressProvider>
  );
}

// Export both for flexibility
export { BossesListPremium as BossesList };
export default BossesListPremium;
