import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchItems } from '../../lib/api';
import FavoriteButton from '../../components/ui/FavoriteButton';
import { Input } from '../../components/ui/Input';
import { Chip } from '../../components/ui/Chip';
import { FaFilter } from 'react-icons/fa';

export function ItemsList() {
  const [page, setPage] = useState(0);
  const { data, isLoading, isError } = useQuery({
      queryKey: ['items', page],
      queryFn: () => fetchItems(page),
      keepPreviousData: true
  });
  
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState({ type: 'all' });

  const items = data ? (Array.isArray(data) ? data : (data.items || [])) : [];
  
  const filteredItems = items.filter(item => {
    const matchesSearch = (item.name || '').toLowerCase().includes(search.toLowerCase());
    const matchesType = activeFilters.type === 'all' || (item.type || '').toLowerCase() === activeFilters.type;
    return matchesSearch && matchesType;
  });

  if (isLoading) return <div className="text-center p-10 text-white">Loading items...</div>;
  if (isError) return <div className="text-center p-10 text-red-500">Error loading items</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start animate-fade-in p-6">
       <aside className="hidden lg:block w-64 shrink-0 space-y-8 sticky top-[100px] text-white">
        <div>
          <h3 className="text-sm font-bold uppercase text-muted mb-4 tracking-wider flex items-center gap-2">
            <FaFilter size={12} /> Filters
          </h3>
           <div className="flex flex-wrap gap-2">
                {['all', 'passive', 'active', 'trinket'].map(type => (
                  <Chip 
                    key={type}
                    active={activeFilters.type === type}
                    onClick={() => setActiveFilters(prev => ({ ...prev, type }))}
                    className="capitalize text-xs cursor-pointer"
                  >
                    {type}
                  </Chip>
                ))}
            </div>
        </div>
      </aside>

      <main className="flex-1">
        <div className="mb-6 flex gap-4">
            <Input 
                placeholder="Search items..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1"
            />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
                <div key={item.id} className="bg-gray-800 p-4 rounded hover:bg-gray-700 transition relative group text-white">
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <FavoriteButton entityType="item" entityId={item.id} />
                    </div>
                    
                    {item.image && <img src={item.image} alt={item.name} className="w-12 h-12 mx-auto mb-2" />}
                    <h3 className="text-center font-bold text-sm text-balance">{item.name}</h3>
                    <p className="text-center text-xs text-gray-400 truncate">{item.description}</p>
                </div>
            ))}
        </div>
        
        <div className="mt-8 flex justify-center gap-4 text-white">
            <button 
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50"
            >
                Previous
            </button>
            <span className="py-2">Page {page}</span>
            <button 
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 bg-gray-700 rounded"
            >
                Next
            </button>
        </div>
      </main>
    </div>
  );
}
