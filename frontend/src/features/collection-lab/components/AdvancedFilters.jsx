/**
 * AdvancedFilters - Sidebar de filtros avanzados
 * Incluye filtros por tipo, calidad, y filtros inteligentes
 */
import { memo } from 'react';
import { motion } from 'framer-motion';
import { FaCrown } from 'react-icons/fa';
import { useBuildLabContext } from '../context/BuildLabContext';
import { useFeatures } from '../../../hooks/useFeatures';
import { getFiltersByCategory, SMART_FILTERS } from '../lib/filterEngine';
import { cn } from '../../../lib/utils';

export const AdvancedFilters = memo(function AdvancedFilters() {
  const { filters, setFilters, toggleSmartFilter } = useBuildLabContext();
  const { isPro, userTier } = useFeatures();
  
  const types = ['all', 'passive', 'active', 'trinket', 'card', 'pill'];
  const qualities = [
    { value: 4, label: 'God Tier', color: 'bg-yellow-500 text-black' },
    { value: 3, label: 'Great', color: 'bg-purple-500 text-white' },
    { value: 2, label: 'Good', color: 'bg-blue-500 text-white' },
    { value: 1, label: 'Decent', color: 'bg-green-600 text-white' },
    { value: 0, label: 'Bad', color: 'bg-gray-600 text-white' },
  ];
  
  const filterCategories = getFiltersByCategory(userTier);
  
  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="sticky top-48"
    >
      <div 
        className="bg-[#f4f1ea] p-6 transform -rotate-1 transition-transform hover:rotate-0"
        style={{
          boxShadow: '2px 4px 15px rgba(0,0,0,0.2)',
          clipPath: 'polygon(0% 0%, 100% 1%, 98% 100%, 2% 99%)',
        }}
      >
        {/* Paper Texture */}
        <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none mix-blend-multiply" />
        
        {/* Tape */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-8 bg-white/40 shadow-sm rotate-1 backdrop-blur-sm z-10 border-l border-r border-white/60" />
        
        <div className="relative z-10 space-y-6">
          
          {/* Title */}
          <h3 className="font-heading text-2xl text-black uppercase tracking-wider pb-2 border-b-2 border-black/80 border-dashed transform -rotate-1">
            Filters
          </h3>
          
          {/* ═══════════════════════════════════════════════════════════ */}
          {/* ITEM TYPE */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <FilterSection title="Item Type" icon="📦">
            <div className="flex flex-wrap gap-1">
              {types.map(type => (
                <button
                  key={type}
                  onClick={() => setFilters({ type })}
                  className={cn(
                    "px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-all",
                    filters.type === type 
                      ? "bg-black text-white" 
                      : "bg-white text-black border border-black/20 hover:bg-black hover:text-white"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </FilterSection>
          
          {/* ═══════════════════════════════════════════════════════════ */}
          {/* QUALITY */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <FilterSection title="Quality Tier" icon="⭐">
            <div className="space-y-1">
              {qualities.map(({ value, label, color }) => {
                const isActive = (filters.quality || []).includes(value);
                return (
                  <button
                    key={value}
                    onClick={() => {
                      const current = filters.quality || [];
                      const next = isActive
                        ? current.filter(q => q !== value)
                        : [...current, value];
                      setFilters({ quality: next });
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 rounded transition-all text-left",
                      isActive ? "bg-black/10 ring-2 ring-black" : "hover:bg-black/5"
                    )}
                  >
                    <span className={cn("w-6 h-6 rounded flex items-center justify-center text-xs font-bold", color)}>
                      {value}
                    </span>
                    <span className="text-sm font-bold">{label}</span>
                    {isActive && <span className="ml-auto text-green-600">✓</span>}
                  </button>
                );
              })}
            </div>
          </FilterSection>
          
          {/* ═══════════════════════════════════════════════════════════ */}
          {/* SMART FILTERS */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <div className="pt-4 border-t-2 border-dashed border-black/20">
            <h4 className="font-handwriting text-lg font-bold text-black/60 mb-3 flex items-center gap-2">
              🧠 Smart Filters
              <span className="text-xs text-yellow-600 flex items-center gap-1">
                <FaCrown className="text-[10px]" /> PRO
              </span>
            </h4>
            
            <div className="space-y-4">
              {filterCategories.map(category => (
                <div key={category.key}>
                  <h5 className="text-xs uppercase tracking-wider text-black/50 mb-2">
                    {category.icon} {category.name}
                  </h5>
                  <div className="space-y-1">
                    {category.filters.map(filter => {
                      const isActive = (filters.smart || []).includes(filter.id);
                      const isLocked = filter.tier === 'pro' && !isPro;
                      
                      return (
                        <button
                          key={filter.id}
                          onClick={(e) => {
                            e.preventDefault();
                            if (isLocked) return;
                            toggleSmartFilter(filter.id);
                          }}
                          disabled={isLocked}
                          className={cn(
                            "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-all text-left",
                            isActive && !isLocked && "bg-accent-gold/20 text-black font-bold",
                            !isActive && !isLocked && "hover:bg-black/5",
                            isLocked && "opacity-40 cursor-not-allowed bg-gray-100"
                          )}
                        >
                          <span>{filter.icon}</span>
                          <span className="flex-1 truncate">{filter.name}</span>
                          {isLocked && (
                            <span className="flex items-center gap-1 text-xs text-yellow-600">
                              <FaCrown className="text-[10px]" />
                              <span className="font-bold">PRO</span>
                            </span>
                          )}
                          {isActive && !isLocked && <span className="text-green-600">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Reset Button */}
          <button
            onClick={() => setFilters({ type: 'all', quality: [], smart: [] })}
            className="w-full py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            Reset All Filters
          </button>
          
        </div>
      </div>
    </motion.aside>
  );
});

// Filter Section Component
function FilterSection({ title, icon, children }) {
  return (
    <div>
      <h4 className="font-handwriting text-lg font-bold text-black/60 mb-3 underline decoration-wavy decoration-accent-blood/30">
        {icon} {title}
      </h4>
      {children}
    </div>
  );
}
