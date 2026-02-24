/**
 * SmartFilterBar - Barra horizontal de filtros inteligentes rápidos
 * Se muestra debajo del buscador para acceso rápido
 */
import { memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCrown } from 'react-icons/fa';
import { useBuildLabContext } from '../context/BuildLabContext';
import { useBuildLab } from '../hooks/useBuildLab';
import { useFeatures } from '../../../hooks/useFeatures';
import { SMART_FILTERS, getSuggestedFilters } from '../lib/filterEngine';
import { cn } from '../../../lib/utils';

// Filtros más útiles para acceso rápido
const QUICK_FILTERS = [
  'high_dps_boost',
  'changes_tear_type',
  'enables_transformation',
  'homing_tears',
  'damage_multiplier',
  'multi_shot',
  'fire_rate_up',
  'low_risk',
];

export const SmartFilterBar = memo(function SmartFilterBar({ className }) {
  const { filters, toggleSmartFilter, setFilters } = useBuildLabContext();
  const { selectedItems } = useBuildLab();
  const { isPro, userTier } = useFeatures();
  
  const activeSmartFilters = filters.smart || [];
  
  // Sugerencias basadas en la build actual
  const suggestions = useMemo(() => {
    if (selectedItems.length === 0) return [];
    return getSuggestedFilters(selectedItems, userTier);
  }, [selectedItems, userTier]);
  
  return (
    <div className={cn("space-y-2", className)}>
      
      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        {QUICK_FILTERS.map(filterId => {
          const filter = SMART_FILTERS[filterId];
          if (!filter) return null;
          
          const isActive = activeSmartFilters.includes(filterId);
          const isLocked = filter.tier === 'pro' && !isPro;
          
          return (
            <button
              key={filterId}
              onClick={() => !isLocked && toggleSmartFilter(filterId)}
              disabled={isLocked}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all",
                "border-2",
                isActive && "bg-accent-gold text-black border-accent-gold",
                !isActive && !isLocked && "bg-black/5 text-black border-black/20 hover:border-black",
                isLocked && "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
              )}
            >
              <span>{filter.icon}</span>
              <span>{filter.name}</span>
              {isActive && <FaTimes className="ml-1" />}
              {isLocked && <FaCrown className="ml-1 text-yellow-500" />}
            </button>
          );
        })}
      </div>
      
      {/* Active Filters & Suggestions */}
      <AnimatePresence>
        {(activeSmartFilters.length > 0 || suggestions.length > 0) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap items-center gap-2 pt-2 border-t border-black/10"
          >
            {/* Active Filters Display */}
            {activeSmartFilters.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-bold uppercase">Active:</span>
                {activeSmartFilters.map(filterId => {
                  const filter = SMART_FILTERS[filterId];
                  if (!filter) return null;
                  
                  return (
                    <motion.span
                      key={filterId}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-1 px-2 py-1 bg-accent-gold/20 text-black text-xs rounded"
                    >
                      {filter.icon} {filter.name}
                      <button 
                        onClick={() => toggleSmartFilter(filterId)}
                        className="ml-1 hover:text-red-600"
                      >
                        <FaTimes />
                      </button>
                    </motion.span>
                  );
                })}
                <button
                  onClick={() => setFilters({ smart: [] })}
                  className="text-xs text-red-600 hover:underline"
                >
                  Clear all
                </button>
              </div>
            )}
            
            {/* Suggestions */}
            {suggestions.length > 0 && selectedItems.length > 0 && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs text-gray-500 font-bold uppercase">Suggested:</span>
                {suggestions.slice(0, 3).map(suggestion => {
                  const filter = SMART_FILTERS[suggestion.id];
                  if (!filter) return null;
                  
                  return (
                    <button
                      key={suggestion.id}
                      onClick={() => toggleSmartFilter(suggestion.id)}
                      className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded hover:bg-blue-200 transition-colors"
                      title={suggestion.reason}
                    >
                      {filter.icon} {filter.name}
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
});
