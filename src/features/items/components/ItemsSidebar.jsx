import React from 'react';
import { motion } from 'framer-motion';
import { Chip } from '../../../components/ui/Chip';
import { FaFilter, FaLayerGroup } from 'react-icons/fa';

export function ItemsSidebar({ activeFilters, setActiveFilters }) {
  const types = ['all', 'passive', 'active', 'trinket', 'card', 'pill'];

  return (
    <motion.aside 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:block w-64 shrink-0 space-y-8 sticky top-[100px] h-fit"
    >
        {/* Category: Item Type */}
        <div className="bg-bg-1 border border-white/5 rounded-2xl p-6">
            <h3 className="text-xs font-bold uppercase text-muted mb-4 tracking-widest flex items-center gap-2">
                <FaLayerGroup /> Item Type
            </h3>
            <div className="flex flex-col gap-2">
                {types.map(type => (
                    <button
                        key={type}
                        onClick={() => setActiveFilters(prev => ({ ...prev, type }))}
                        className={`
                            text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between group
                            ${activeFilters.type === type 
                                ? 'bg-blood/20 text-blood font-semibold border border-blood/20' 
                                : 'text-muted-foreground hover:bg-white/5 hover:text-fg'
                            }
                        `}
                    >
                        <span className="capitalize">{type}</span>
                        {activeFilters.type === type && (
                            <motion.div layoutId="active-dot" className="w-1.5 h-1.5 rounded-full bg-blood" />
                        )}
                    </button>
                ))}
            </div>
        </div>

        {/* Placeholder: More Filters (Pools, Tags) */}
        <div className="bg-bg-1 border border-white/5 rounded-2xl p-6 opacity-50 cursor-not-allowed">
             <h3 className="text-xs font-bold uppercase text-muted mb-4 tracking-widest flex items-center gap-2">
                <FaFilter /> Pools (Coming Soon)
            </h3>
            <div className="flex flex-wrap gap-2">
                {['Treasure', 'Shop', 'Devil', 'Angel'].map(pool => (
                    <span key={pool} className="text-xs border border-white/10 px-2 py-1 rounded text-muted">
                        {pool}
                    </span>
                ))}
            </div>
        </div>
    </motion.aside>
  );
}
