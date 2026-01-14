import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { FaSearch, FaUser } from 'react-icons/fa';
import { cn } from '../../lib/utils';
import { charactersData } from '../../features/characters/data/charactersData';

export function CharactersList() {
  const [search, setSearch] = useState('');

  const filteredCharacters = charactersData.filter(char => 
    char.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-fg flex items-center gap-3">
             <FaUser className="text-gold" /> Characters
          </h1>
          <p className="text-muted mt-2">
            The playable cast of The Binding of Isaac.
            Showing {filteredCharacters.length} characters.
          </p>
        </div>

        <div className="w-full md:w-auto">
           <Input 
             icon={FaSearch} 
             placeholder="Search characters..." 
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             onClear={() => setSearch('')}
             className="md:w-72"
           />
        </div>
      </div>

      {/* Grid */}
      {filteredCharacters.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredCharacters.map((char) => (
            <Card 
              key={char.id} 
              variant="interactive"
              className="group flex flex-col items-center p-6 gap-4 hover:border-gold/30 transition-all duration-300"
            >
              <div className="w-32 h-32 flex items-center justify-center relative">
                 {/* Glow effect behind character */}
                 <div className="absolute inset-0 bg-gold/5 blur-xl rounded-full scale-0 group-hover:scale-100 transition-transform duration-500" />
                 
                 <img 
                   src={char.sprite_url} 
                   alt={char.name}
                   loading="lazy"
                   className="w-full h-full object-contain drop-shadow-md z-10 filter hover:brightness-110 transition-all"
                   onError={(e) => {
                     e.target.onerror = null; 
                     e.target.src = 'https://placehold.co/100x100/1a1614/e6dcc8?text=?'; 
                   }}
                />
              </div>

              <div className="text-center w-full mt-2">
                <h3 className="font-bold font-serif text-xl text-fg mb-1 group-hover:text-gold transition-colors">{char.name}</h3>
                <div className="w-8 h-1 bg-border rounded-full mx-auto group-hover:bg-gold/50 transition-colors" />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center border border-dashed border-border rounded-lg bg-bg-1/50">
           <FaUser className="text-4xl text-muted/20 mx-auto mb-4" />
           <p className="text-muted text-lg">No characters found matching "{search}".</p>
        </div>
      )}
    </div>
  );
}
