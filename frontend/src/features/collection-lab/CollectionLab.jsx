/**
 * CollectionLab - Página principal del Laboratorio Estratégico
 * THE COLLECTION reimaginado como herramienta de power user
 */
import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFlask, FaBook, FaBalanceScale, FaChartBar, FaFilter } from 'react-icons/fa';

import { BuildLabProvider, useBuildLabContext } from './context/BuildLabContext';
import { useBuildLab } from './hooks/useBuildLab';
import { usePaginatedItems } from './hooks/usePaginatedItems';
import { useFeatures } from '../../hooks/useFeatures';

import { BuildLabBar } from './components/BuildLabBar';
import { BuildStatsPanel } from './components/BuildStatsPanel';
import { LabItemGrid } from './components/LabItemGrid';
import { AdvancedFilters } from './components/AdvancedFilters';
import { SmartFilterBar } from './components/SmartFilterBar';
import { ItemCompareModal } from './components/ItemCompareModal';
import { GlobalStatsPanel } from './components/GlobalStatsPanel';
import { Pagination } from '../../components/ui/Pagination';

import { cn } from '../../lib/utils';

// Componente interno que usa el context
function CollectionLabContent() {
  const { t } = useTranslation();
  const { isPro } = useFeatures();
  const { mode, setMode, compareItems, clearCompare, filters } = useBuildLabContext();
  const { metrics, labState } = useBuildLab();
  
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [showStats, setShowStats] = useState(false);
  
  const containerRef = useRef(null);
  
  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [search, filters.type, filters.quality, filters.smart]);
  
  // Paginated data
  const { 
    items, 
    meta, 
    isLoading,
    isFetching 
  } = usePaginatedItems({ search, page });

  return (
    <div ref={containerRef} className="min-h-screen bg-bg-paper text-text-ink">
      
      {/* ═══════════════════════════════════════════════════════════ */}
      {/* HEADER - LAB TITLE & MODE TOGGLE */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-40 bg-bg-paper/95 backdrop-blur-sm border-b-4 border-dashed border-black/20 pb-4 pt-6 px-4 lg:px-8">
        <div className="max-w-screen-2xl mx-auto">
          
          {/* Title Row */}
          <div className="flex flex-col lg:flex-row lg:items-end gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading tracking-tighter text-black leading-none">
                THE COLLECTION
              </h1>
              <p className="font-handwriting text-xl text-accent-blood mt-1 rotate-[-1deg]">
                Strategic Laboratory
              </p>
            </div>
            
            {/* Mode Toggle */}
            <div className="flex gap-2 bg-black/5 p-1 rounded-lg">
              <ModeButton 
                active={mode === 'collection'} 
                onClick={() => setMode('collection')}
                icon={<FaBook />}
                label="Collection"
              />
              <ModeButton 
                active={mode === 'buildlab'} 
                onClick={() => setMode('buildlab')}
                icon={<FaFlask />}
                label="Build Lab"
                badge={labState.itemCount > 0 ? labState.itemCount : null}
              />
              {isPro && (
                <>
                  <ModeButton 
                    active={mode === 'compare'} 
                    onClick={() => setMode('compare')}
                    icon={<FaBalanceScale />}
                    label="Compare"
                    badge={compareItems.length > 0 ? compareItems.length : null}
                  />
                  <ModeButton 
                    active={showStats} 
                    onClick={() => setShowStats(!showStats)}
                    icon={<FaChartBar />}
                    label="Stats"
                    variant="secondary"
                  />
                </>
              )}
            </div>
          </div>
          
          {/* Search & Filters Bar */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder={t('search.searchArtifacts')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={cn(
                  "w-full bg-black/90 text-white font-pixel text-lg",
                  "pl-4 pr-12 py-4 border-2 border-black/50",
                  "focus:outline-none focus:border-accent-gold",
                  "shadow-[4px_4px_0_rgba(0,0,0,0.3)]",
                  "placeholder:text-gray-600 transition-all"
                )}
                style={{ borderRadius: '2px' }}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-mono">
                {meta.loaded}/{meta.total}
              </span>
            </div>
            
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-2 px-6 py-4 font-heading text-lg uppercase tracking-wider",
                "border-2 transition-all",
                showFilters 
                  ? "bg-accent-gold text-black border-accent-gold" 
                  : "bg-white text-black border-black hover:bg-black hover:text-white"
              )}
            >
              <FaFilter />
              <span>Filters</span>
            </button>
          </div>
          
          {/* Smart Filters Bar */}
          <SmartFilterBar className="mt-4" />
        </div>
      </header>
      
      {/* ═══════════════════════════════════════════════════════════ */}
      {/* BUILD LAB BAR - Sticky cuando está activo */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {mode === 'buildlab' && (
          <BuildLabBar className="sticky top-[200px] z-30" />
        )}
      </AnimatePresence>
      
      {/* ═══════════════════════════════════════════════════════════ */}
      {/* MAIN CONTENT */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <main className="max-w-screen-2xl mx-auto px-4 lg:px-8 py-8">
        <div className="flex gap-8">
          
          {/* Sidebar Filters (Desktop) */}
          <AnimatePresence>
            {showFilters && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="hidden lg:block flex-shrink-0 overflow-hidden"
              >
                <AdvancedFilters />
              </motion.aside>
            )}
          </AnimatePresence>
          
          {/* Item Grid */}
          <div className="flex-1 min-w-0">
            <LabItemGrid 
              items={items} 
              isLoading={isLoading}
              mode={mode}
            />
            
            {/* Pagination Controls */}
            {meta.totalPages > 1 && (
              <div className="mt-8">
                <Pagination 
                  currentPage={page}
                  totalPages={meta.totalPages}
                  onPageChange={setPage}
                />
                <div className="text-center mt-2">
                  <span className="text-sm text-gray-500 font-handwriting">
                    {meta.total} items total • Page {page + 1} of {meta.totalPages}
                  </span>
                </div>
              </div>
            )}
            
            {/* Loading indicator */}
            {isFetching && !isLoading && (
              <div className="text-center mt-4">
                <span className="font-pixel text-gray-500 animate-pulse">Loading...</span>
              </div>
            )}
          </div>
          
          {/* Stats Panel (PRO) */}
          <AnimatePresence>
            {showStats && isPro && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="hidden xl:block flex-shrink-0 overflow-hidden"
              >
                <GlobalStatsPanel />
              </motion.aside>
            )}
          </AnimatePresence>
        </div>
      </main>
      
      {/* ═══════════════════════════════════════════════════════════ */}
      {/* BUILD STATS PANEL - Fixed en desktop, drawer en mobile */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {mode === 'buildlab' && metrics && (
          <BuildStatsPanel metrics={metrics} />
        )}
      </AnimatePresence>
      
      {/* ═══════════════════════════════════════════════════════════ */}
      {/* COMPARE MODAL */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {mode === 'compare' && compareItems.length === 2 && (
          <ItemCompareModal 
            itemA={compareItems[0]} 
            itemB={compareItems[1]}
            onClose={clearCompare}
          />
        )}
      </AnimatePresence>
      
    </div>
  );
}

// Mode Button Component
function ModeButton({ active, onClick, icon, label, badge, variant = 'primary' }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-2 px-4 py-2 font-heading text-sm uppercase tracking-wider rounded-md transition-all",
        variant === 'primary' && active && "bg-black text-white",
        variant === 'primary' && !active && "bg-transparent text-black hover:bg-black/10",
        variant === 'secondary' && active && "bg-accent-gold text-black",
        variant === 'secondary' && !active && "bg-transparent text-black hover:bg-accent-gold/20",
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
      {badge && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-blood text-white text-xs rounded-full flex items-center justify-center font-bold">
          {badge}
        </span>
      )}
    </button>
  );
}

// Export principal con Provider
export function CollectionLab() {
  return (
    <BuildLabProvider>
      <CollectionLabContent />
    </BuildLabProvider>
  );
}
