import React from 'react';
import { motion } from 'framer-motion';
import { Chip } from '../../../components/ui/Chip';
import { FaFilter, FaLayerGroup } from 'react-icons/fa';

// Hand-drawn circle component for active selection
const PencilCircle = () => (
    <motion.svg 
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="absolute inset-0 w-full h-full text-accent-blood pointer-events-none -z-10 scale-110" 
        viewBox="0 0 100 40" 
        preserveAspectRatio="none"
    >
        {/* Rough circle path */}
        <path 
            d="M5,20 Q20,5 50,5 T95,20 Q80,35 50,35 T5,20 M4,20 Q20,4 50,4" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round"
        />
    </motion.svg>
);

export function ItemsSidebar({ activeFilters, setActiveFilters }) {
  const types = ['all', 'passive', 'active', 'trinket', 'card', 'pill'];

  return (
    <motion.aside 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:block w-64 shrink-0 space-y-8 sticky top-[100px] h-fit"
    >
        {/* Category: Item Type */}
        <div className="relative p-2">
            
            {/* Hand-drawn Header */}
            <h3 className="text-xl font-handwriting font-bold text-[#1a1a1a] mb-6 flex items-center gap-2 border-b-2 border-text-ink/20 pb-2 border-dashed">
                <FaLayerGroup className="text-sm opacity-50" /> 
                <span>Item Type</span>
            </h3>

            <div className="flex flex-col gap-3 font-handwriting text-lg">
                {types.map(type => {
                    const isActive = activeFilters.type === type;
                    return (
                        <button
                            key={type}
                            onClick={() => setActiveFilters(prev => ({ ...prev, type }))}
                            className={`
                                relative text-left px-4 py-1.5 transition-all flex items-center justify-between group
                                ${isActive ? 'text-[#1a1a1a] font-bold translate-x-2' : 'text-[#1a1a1a]/70 hover:text-[#1a1a1a] hover:translate-x-1'}
                            `}
                        >
                            <span className="capitalize relative z-10">{type}</span>
                            
                            {/* Pencil Circle Highlight */}
                            {isActive && <PencilCircle />}
                            
                            {/* Hover Arrow (if not active) */}
                            {!isActive && (
                                <span className="opacity-0 group-hover:opacity-50 text-xs transition-opacity absolute right-2 text-[#1a1a1a]">
                                    &larr;
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>

        {/* Separator Scribble */}
        <div className="w-full h-4 opacity-30">
             <svg width="100%" height="100%" viewBox="0 0 200 20" preserveAspectRatio="none">
                 <path d="M0,10 Q50,0 100,10 T200,10" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
             </svg>
        </div>

        {/* Placeholder: More Filters (Pools, Tags) */}
        <div className="relative p-2 opacity-60">
             <h3 className="text-xl font-handwriting font-bold text-text-ink mb-6 flex items-center gap-2 border-b-2 border-text-ink/20 pb-2 border-dashed">
                <FaFilter className="text-sm opacity-50" /> 
                <span>Pools</span>
            </h3>
            <div className="flex flex-wrap gap-2 font-handwriting">
                {['Treasure', 'Shop', 'Devil', 'Angel'].map(pool => (
                    <span key={pool} className="text-base border border-text-ink/30 px-3 py-1 rounded-sm text-text-dim rotate-1 hover:rotate-0 transition-transform cursor-not-allowed">
                        {pool}
                    </span>
                ))}
            </div>
        </div>
    </motion.aside>
  );
}
