import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { FaSearch, FaSkull } from 'react-icons/fa';
import { cn } from '../../lib/utils';
import { bossesData } from '../../features/bosses/data/bossesData';

export function BossesList() {
  const [search, setSearch] = useState('');

  const filteredBosses = bossesData.filter(boss => 
    boss.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-fg flex items-center gap-3">
             <FaSkull className="text-blood" /> Bosses
          </h1>
          <p className="text-muted mt-2">
            Formidable foes found in the basement and beyond.
            Showing {filteredBosses.length} bosses.
          </p>
        </div>

        <div className="w-full md:w-auto">
           <Input 
             icon={FaSearch} 
             placeholder="Search bosses..." 
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             onClear={() => setSearch('')}
             className="md:w-72"
           />
        </div>
      </div>

      {/* Grid */}
      {filteredBosses.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredBosses.map((boss) => (
            <Card 
              key={boss.id} 
              variant="interactive"
              className="group flex flex-col items-center p-4 gap-4 hover:shadow-lg hover:shadow-blood/10 transition-all duration-300"
            >
              <div className="w-24 h-24 flex items-center justify-center bg-bg-0 rounded-full border border-border group-hover:scale-110 transition-transform duration-300 shadow-inner overflow-hidden relative">
                <div className="absolute inset-0 bg-blood/5 rounded-full pointer-events-none group-hover:bg-blood/0 transition-colors" />
                <img 
                   src={boss.sprite_url} 
                   alt={boss.name}
                   loading="lazy"
                   className="max-w-[80%] max-h-[80%] object-contain drop-shadow-sm filter grayscale-[0.3] group-hover:grayscale-0 transition-all"
                   onError={(e) => {
                     e.target.onerror = null; 
                     e.target.src = 'https://placehold.co/100x100/1a1614/e6dcc8?text=?'; // Fallback
                   }}
                />
              </div>

              <div className="text-center w-full">
                <h3 className="font-bold text-fg truncate text-lg group-hover:text-blood transition-colors">{boss.name}</h3>
                <span className="text-[10px] font-mono text-muted uppercase tracking-widest opacity-50 group-hover:opacity-100">
                  ID: {boss.id}
                </span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center border border-dashed border-border rounded-lg bg-bg-1/50">
           <FaSkull className="text-4xl text-muted/20 mx-auto mb-4" />
           <p className="text-muted text-lg">No bosses found matching "{search}".</p>
        </div>
      )}
    </div>
  );
}
