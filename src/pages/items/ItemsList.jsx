import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Chip } from '../../components/ui/Chip';
import { Button } from '../../components/ui/Button';
import { itemsData } from '../../features/items/data/mockItems';
import { cn } from '../../lib/utils';
import { FaSearch, FaFilter, FaThLarge, FaList } from 'react-icons/fa';

export function ItemsList() {
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState({ type: 'all' });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const navigate = useNavigate();

  const handleFilterChange = (key, value) => {
    setActiveFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredItems = itemsData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = activeFilters.type === 'all' || item.type === activeFilters.type;
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      
      {/* --- SIDEBAR FILTERS (Desktop) --- */}
      <aside className="hidden lg:block w-64 shrink-0 space-y-8 sticky top-[100px]">
        <div>
          <h3 className="text-sm font-bold uppercase text-muted mb-4 tracking-wider flex items-center gap-2">
            <FaFilter size={12} /> Filters
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="text-xs font-semibold text-fg mb-2 block">Item Type</label>
              <div className="flex flex-wrap gap-2">
                {['all', 'passive', 'active', 'trinket'].map(type => (
                  <Chip 
                    key={type}
                    active={activeFilters.type === type}
                    onClick={() => handleFilterChange('type', type)}
                    className="capitalize text-xs"
                  >
                    {type}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="ink-separator !my-4 opacity-50" />

            <div>
               <label className="text-xs font-semibold text-fg mb-2 block">Pools</label>
               <div className="space-y-1">
                 {['Treasure', 'Shop', 'Boss', 'Devil', 'Angel'].map(pool => (
                   <label key={pool} className="flex items-center gap-2 text-sm text-muted hover:text-fg cursor-pointer">
                     <input type="checkbox" className="rounded bg-bg-2 border-border text-gold focus:ring-gold" />
                     {pool}
                   </label>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 w-full min-w-0">
        
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-end md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-serif font-bold text-fg">Items Codex</h1>
            <p className="text-sm text-muted mt-1">Showing {filteredItems.length} results</p>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
             <Input 
               icon={FaSearch} 
               placeholder="Search..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               onClear={() => setSearch('')}
               className="md:w-64"
             />
             <div className="flex bg-bg-2 rounded-md p-1 border border-border">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={cn("p-2 rounded text-muted hover:text-fg transition-colors", viewMode === 'grid' && "bg-panel text-gold shadow-sm")}
                >
                  <FaThLarge />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={cn("p-2 rounded text-muted hover:text-fg transition-colors", viewMode === 'list' && "bg-panel text-gold shadow-sm")}
                >
                  <FaList />
                </button>
             </div>
          </div>
        </div>

        {/* Mobile Filters (Horizontal Scroll) */}
        <div className="lg:hidden flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
            {['all', 'passive', 'active', 'trinket'].map(type => (
                  <Chip 
                    key={type}
                    active={activeFilters.type === type}
                    onClick={() => handleFilterChange('type', type)}
                    className="capitalize shrink-0"
                  >
                    {type}
                  </Chip>
            ))}
        </div>

        {/* Grid / List */}
        {filteredItems.length > 0 ? (
          <div className={cn(
            "grid gap-4",
            viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
          )}>
            {filteredItems.map((item) => (
              <Card 
                key={item.id} 
                variant="interactive"
                onClick={() => navigate(`/items/${item.id}`)}
                className={cn(
                  "group relative overflow-hidden",
                  viewMode === 'list' ? "flex flex-row items-center gap-4" : "flex flex-col gap-4"
                )}
              >
                {/* Image Placeholder */}
                <div className={cn(
                  "shrink-0 bg-bg-0 border border-border rounded flex items-center justify-center text-3xl shadow-inset",
                  viewMode === 'list' ? "w-16 h-16" : "w-full aspect-square md:aspect-[4/3]"
                )}>
                  <span className="group-hover:scale-125 transition-transform duration-300">📦</span>
                </div>

                <div className="flex-1 min-w-0">
                   <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-fg truncate text-lg group-hover:text-gold transition-colors">{item.name}</h3>
                      <span className={cn(
                        "text-[10px] font-mono px-1.5 rounded border border-white/5",
                        item.quality === 4 ? "text-gold bg-gold/10 border-gold/20" : "text-muted"
                      )}>Q{item.quality}</span>
                   </div>
                   <p className="text-sm text-muted italic truncate">{item.description}</p>
                   
                   {/* Tags */}
                   <div className="mt-3 flex flex-wrap gap-1">
                      {item.tags.slice(0, viewMode === 'list' ? 6 : 2).map(tag => (
                        <span key={tag} className="text-[10px] uppercase font-bold text-muted-2 bg-bg-0 px-1 rounded">{tag}</span>
                      ))}
                      {item.tags.length > (viewMode === 'list' ? 6 : 2) && <span className="text-[10px] text-muted-2">+more</span>}
                   </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border border-dashed border-border rounded-lg">
             <p className="text-muted">No items found matching your filters.</p>
             <Button variant="ghost" className="mt-2" onClick={() => {setSearch(''); setActiveFilters({type:'all'})}}>Clear Filters</Button>
          </div>
        )}

      </div>
    </div>
  );
}
