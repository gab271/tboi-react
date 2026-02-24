import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { 
  FaFilter, FaSort, FaSkull, FaTrophy, FaFire, FaStar, FaCrown,
  FaTimes, FaChevronDown, FaCheck, FaLock
} from 'react-icons/fa';
import { GiCrossedSwords, GiDeathSkull, GiTargeted } from 'react-icons/gi';
import { useTranslation } from 'react-i18next';
import { DEFEAT_STATUS, FILTER_OPTIONS, ALL_FLOORS } from '../types/boss.types';
import { useBossProgress } from '../context/BossProgressContext';
import { useFeatures } from '../../../hooks/useFeatures';

/**
 * Filter chip component with paper style
 */
function FilterChip({ 
  label, 
  icon: Icon, 
  active, 
  onClick, 
  variant = 'default',
  isPro = false,
  isLocked = false 
}) {
  const variants = {
    default: {
      active: 'bg-[#8b0000] text-[#f4e4bc] border-[#5c0000]',
      inactive: 'bg-[#f4e4bc] text-[#2a1a10] border-[#4a2c10] hover:bg-[#e8dcc5]'
    },
    gold: {
      active: 'bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] text-[#2a1a10] border-[#b45309]',
      inactive: 'bg-[#f4e4bc] text-[#b45309] border-[#b45309] hover:bg-[#fef3c7]'
    }
  };
  
  const style = variants[variant] || variants.default;
  
  return (
    <motion.button
      className={cn(
        "relative flex items-center gap-2 px-3 py-1.5 border-2 font-handwriting text-sm",
        "transition-all duration-200 transform",
        "shadow-[2px_2px_0_rgba(0,0,0,0.2)]",
        active ? style.active : style.inactive,
        isLocked && "opacity-60 cursor-not-allowed"
      )}
      onClick={isLocked ? undefined : onClick}
      whileHover={!isLocked ? { scale: 1.05, rotate: Math.random() * 2 - 1 } : {}}
      whileTap={!isLocked ? { scale: 0.95 } : {}}
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span className="uppercase tracking-wide">{label}</span>
      
      {/* PRO badge */}
      {isPro && (
        <span className="absolute -top-2 -right-2 bg-[#fbbf24] text-[#2a1a10] text-[8px] font-bold px-1 py-0.5 rounded">
          PRO
        </span>
      )}
      
      {/* Lock icon */}
      {isLocked && (
        <FaLock className="w-3 h-3 ml-1 opacity-50" />
      )}
      
      {/* Active checkmark */}
      {active && !isLocked && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-4 h-4 bg-green-600 rounded-full flex items-center justify-center"
        >
          <FaCheck className="w-2 h-2 text-white" />
        </motion.div>
      )}
    </motion.button>
  );
}

/**
 * Dropdown select with paper style
 */
function PaperSelect({ label, options, value, onChange, icon: Icon, isPro = false, isLocked = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(o => o.id === value) || options[0];
  
  return (
    <div className="relative">
      <motion.button
        className={cn(
          "flex items-center gap-2 px-4 py-2 border-2 font-handwriting text-base",
          "bg-[#f4e4bc] text-[#2a1a10] border-[#4a2c10]",
          "shadow-[2px_2px_0_rgba(0,0,0,0.2)] hover:shadow-[1px_1px_0_rgba(0,0,0,0.2)]",
          "transition-all duration-200",
          isLocked && "opacity-60 cursor-not-allowed"
        )}
        onClick={() => !isLocked && setIsOpen(!isOpen)}
        whileHover={!isLocked ? { rotate: -1 } : {}}
      >
        {Icon && <Icon className="w-4 h-4 text-[#8b0000]" />}
        <span className="uppercase tracking-wide">{label}:</span>
        <span className="font-bold">{selectedOption?.label}</span>
        <FaChevronDown className={cn(
          "w-3 h-3 transition-transform",
          isOpen && "rotate-180"
        )} />
        
        {isPro && (
          <span className="absolute -top-2 -right-2 bg-[#fbbf24] text-[#2a1a10] text-[8px] font-bold px-1 py-0.5 rounded">
            PRO
          </span>
        )}
      </motion.button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-full left-0 mt-2 min-w-full z-50"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
          >
            <div className="bg-[#fdfbf7] border-2 border-[#4a2c10] shadow-lg p-2 space-y-1">
              {/* Tape decoration */}
              <div className="absolute -top-2 left-4 w-8 h-4 bg-[#e0d8c3]/80 rotate-[-2deg]" />
              
              {options.map((option) => (
                <button
                  key={option.id}
                  className={cn(
                    "w-full text-left px-3 py-1.5 font-handwriting text-sm",
                    "transition-colors hover:bg-[#e8dcc5]",
                    value === option.id && "bg-[#8b0000]/10 font-bold"
                  )}
                  onClick={() => {
                    onChange(option.id);
                    setIsOpen(false);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Advanced Filter Bar Component
 * Provides filtering and sorting options for the bounty board
 */
export function AdvancedFilterBar({ 
  filters, 
  setFilters, 
  sortBy, 
  setSortBy,
  className 
}) {
  const { t } = useTranslation();
  const { hasPremium } = useFeatures();
  const { hasSaveLoaded } = useBossProgress();
  const [expanded, setExpanded] = useState(false);
  
  // Status filter options with icons
  const statusFilters = [
    { id: 'all', label: t('bosses.filter.all', 'All'), icon: FaSkull },
    { id: DEFEAT_STATUS.NOT_DEFEATED, label: t('bosses.filter.notDefeated', 'Wanted'), icon: GiTargeted },
    { id: DEFEAT_STATUS.NORMAL, label: t('bosses.filter.normal', 'Normal'), icon: FaTrophy },
    { id: DEFEAT_STATUS.HARD, label: t('bosses.filter.hard', 'Hard'), icon: FaFire },
    { id: DEFEAT_STATUS.MASTERED, label: t('bosses.filter.mastered', 'Mastered'), icon: FaCrown, variant: 'gold' }
  ];
  
  // Sort options
  const sortOptions = [
    { id: 'default', label: t('bosses.sort.default', 'Default') },
    { id: 'difficulty_asc', label: t('bosses.sort.easiest', 'Easiest') },
    { id: 'difficulty_desc', label: t('bosses.sort.hardest', 'Hardest') },
    { id: 'name_asc', label: t('bosses.sort.nameAZ', 'Name A-Z') },
    { id: 'name_desc', label: t('bosses.sort.nameZA', 'Name Z-A') },
    // PRO options
    { id: 'lethal', label: t('bosses.sort.lethal', 'Most Lethal'), isPro: true },
    { id: 'community', label: t('bosses.sort.community', 'Community'), isPro: true },
    { id: 'unlock_priority', label: t('bosses.sort.unlocks', 'Best Unlocks'), isPro: true }
  ];
  
  // Floor filter options
  const floorOptions = [
    { id: 'all', label: t('bosses.floor.all', 'All Floors') },
    ...ALL_FLOORS.map(f => ({ id: f.id, label: f.name }))
  ];
  
  const handleStatusFilter = useCallback((status) => {
    setFilters(prev => ({ ...prev, status }));
  }, [setFilters]);
  
  const handleFloorFilter = useCallback((floor) => {
    setFilters(prev => ({ ...prev, floor }));
  }, [setFilters]);
  
  const handleSort = useCallback((sort) => {
    // Check if PRO feature
    const option = sortOptions.find(o => o.id === sort);
    if (option?.isPro && !hasPremium) return;
    setSortBy(sort);
  }, [setSortBy, hasPremium]);
  
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.floor !== 'all') count++;
    if (sortBy !== 'default') count++;
    return count;
  }, [filters, sortBy]);
  
  return (
    <div className={cn("relative", className)}>
      {/* Paper background for filter bar */}
      <motion.div 
        className="relative bg-[#fdfbf7] border-2 border-[#4a2c10] p-4 shadow-md"
        style={{ transform: 'rotate(-0.5deg)' }}
        layout
      >
        {/* Tape decorations */}
        <div className="absolute -top-2 left-8 w-12 h-4 bg-[#e0d8c3]/80 rotate-[-3deg] shadow-sm" />
        <div className="absolute -top-2 right-8 w-12 h-4 bg-[#e0d8c3]/80 rotate-[2deg] shadow-sm" />
        
        {/* Header row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <FaFilter className="w-5 h-5 text-[#8b0000]" />
            <h3 className="font-heading text-xl text-[#2a1a10] uppercase tracking-wide">
              {t('bosses.filters', 'Hunt Filters')}
            </h3>
            {activeFilterCount > 0 && (
              <span className="bg-[#8b0000] text-[#f4e4bc] text-xs font-bold px-2 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          
          <button
            className="flex items-center gap-2 text-[#8b0000] font-handwriting text-sm hover:underline"
            onClick={() => {
              setFilters({ status: 'all', floor: 'all' });
              setSortBy('default');
            }}
          >
            <FaTimes className="w-3 h-3" />
            {t('bosses.clearFilters', 'Clear All')}
          </button>
        </div>
        
        {/* Status filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          {statusFilters.map(filter => (
            <FilterChip
              key={filter.id}
              label={filter.label}
              icon={filter.icon}
              active={filters.status === filter.id}
              onClick={() => handleStatusFilter(filter.id)}
              variant={filter.variant}
              // Disable progress filters if no save loaded
              isLocked={!hasSaveLoaded && filter.id !== 'all'}
            />
          ))}
        </div>
        
        {/* Secondary row: Sort & Floor */}
        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-[#4a2c10]/20">
          <PaperSelect
            label={t('bosses.sortBy', 'Sort')}
            icon={FaSort}
            options={sortOptions.filter(o => !o.isPro || hasPremium)}
            value={sortBy}
            onChange={handleSort}
          />
          
          <PaperSelect
            label={t('bosses.floor', 'Floor')}
            icon={GiDeathSkull}
            options={floorOptions}
            value={filters.floor}
            onChange={handleFloorFilter}
          />
          
          {/* PRO sort options preview */}
          {!hasPremium && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-[#8b0000]/60 font-handwriting">
                {t('bosses.proSorts', 'More sorting options')}
              </span>
              <span className="bg-[#fbbf24] text-[#2a1a10] text-[10px] font-bold px-1.5 py-0.5 rounded">
                PRO
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Hook to apply filters and sorting to boss list
 */
export function useFilteredBosses(bossList, filters, sortBy) {
  const { getBossStatus } = useBossProgress();
  
  return useMemo(() => {
    if (!bossList?.length) return [];
    
    let filtered = [...bossList];
    
    // Apply status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(boss => {
        const status = getBossStatus(boss.id);
        return status === filters.status;
      });
    }
    
    // Apply floor filter
    if (filters.floor && filters.floor !== 'all') {
      filtered = filtered.filter(boss => {
        const bossFloor = boss.location?.toLowerCase().replace(/\s+/g, '-') || '';
        return bossFloor.includes(filters.floor) || filters.floor.includes(bossFloor.split('/')[0].trim());
      });
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'difficulty_asc':
        filtered.sort((a, b) => (a.difficulty || 0) - (b.difficulty || 0));
        break;
      case 'difficulty_desc':
        filtered.sort((a, b) => (b.difficulty || 0) - (a.difficulty || 0));
        break;
      case 'name_asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'lethal':
        // Sort by death rate (would need stats data)
        filtered.sort((a, b) => (b.stats?.deathRate || 0) - (a.stats?.deathRate || 0));
        break;
      case 'community':
        // Sort by completion rate
        filtered.sort((a, b) => (b.stats?.completionRate || 0) - (a.stats?.completionRate || 0));
        break;
      case 'unlock_priority':
        // Sort by unlock value (bosses with unique unlocks first)
        filtered.sort((a, b) => (b.unlocks?.length || 0) - (a.unlocks?.length || 0));
        break;
      default:
        // Default order
        break;
    }
    
    return filtered;
  }, [bossList, filters, sortBy, getBossStatus]);
}

export default AdvancedFilterBar;
