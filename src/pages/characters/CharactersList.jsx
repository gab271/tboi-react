import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { FaSearch, FaUser, FaSkull, FaGhost } from 'react-icons/fa';
import { cn } from '../../lib/utils';
import { charactersData } from '../../features/characters/data/charactersData';
import { CharacterModal } from '../../features/characters/components/CharacterModal';

export function CharactersList() {
  const [search, setSearch] = useState('');
  const [showTainted, setShowTainted] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  const filteredCharacters = charactersData.filter(char => 
    char.name.toLowerCase().includes(search.toLowerCase()) && 
    char.isTainted === showTainted
  );

  return (
    <div className="flex flex-col gap-8 animate-fade-in relative">
      <CharacterModal 
        character={selectedCharacter} 
        isOpen={!!selectedCharacter} 
        onClose={() => setSelectedCharacter(null)} 
      />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-fg flex items-center gap-3">
             <FaUser className="text-gold" /> Characters
          </h1>
          <p className="text-muted mt-2">
            The playable cast of The Binding of Isaac.
            Showing {filteredCharacters.length} {showTainted ? 'Tainted' : 'Normal'} characters.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
           {/* Tainted Toggle */}
           <div className="bg-bg-1 p-1 rounded-lg border border-border flex">
              <button
                onClick={() => setShowTainted(false)}
                className={cn(
                    "px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2",
                    !showTainted ? "bg-bg-2 text-fg shadow-sm" : "text-muted hover:text-fg"
                )}
              >
                 <FaUser /> Normal
              </button>
              <button
                onClick={() => setShowTainted(true)}
                className={cn(
                    "px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2",
                    showTainted ? "bg-red-900/20 text-red-400 shadow-sm" : "text-muted hover:text-red-400"
                )}
              >
                 <FaGhost /> Tainted
              </button>
           </div>

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
              onClick={() => setSelectedCharacter(char)}
              className="group flex flex-col items-center p-6 gap-4 hover:border-gold/30 transition-all duration-300 cursor-pointer"
            >
              <div className="w-32 h-32 flex items-center justify-center relative">
                 {/* Glow effect behind character */}
                 <div className={cn(
                    "absolute inset-0 blur-xl rounded-full scale-0 group-hover:scale-100 transition-transform duration-500",
                    char.isTainted ? "bg-red-900/20" : "bg-gold/5"
                 )} />
                 
                 <img 
                   src={char.image} 
                   alt={char.name}
                   loading="lazy"
                   className={cn(
                       "w-full h-full object-contain drop-shadow-md z-10 filter hover:brightness-110 transition-all",
                       char.isTainted && "sepia-[.5] hue-rotate-[-30deg]" 
                   )}
                   onError={(e) => {
                     e.target.onerror = null; 
                     e.target.src = 'https://placehold.co/100x100/1a1614/e6dcc8?text=?'; 
                   }}
                />
              </div>

              <div className="text-center w-full mt-2">
                <h3 className={cn(
                    "font-bold font-serif text-xl mb-1 transition-colors",
                    char.isTainted ? "text-red-300 group-hover:text-red-400" : "text-fg group-hover:text-gold"
                )}>
                    {char.name}
                </h3>
                <div className={cn(
                    "w-8 h-1 rounded-full mx-auto transition-colors",
                    char.isTainted ? "bg-red-900/50 group-hover:bg-red-500/50" : "bg-border group-hover:bg-gold/50"
                )} />
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
