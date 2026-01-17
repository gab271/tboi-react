import React, { useState } from 'react';
import { Input } from '../../components/ui/Input';
import { FaSearch, FaUser, FaGhost } from 'react-icons/fa';
import { cn } from '../../lib/utils';
import { charactersData } from '../../features/characters/data/charactersData';
import { CharacterModal } from '../../features/characters/components/CharacterModal';
import { CharacterGridCard } from '../../features/characters/components/CharacterGridCard'; 

export function CharactersList() {
  const [search, setSearch] = useState('');
  const [showTainted, setShowTainted] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  const filteredCharacters = charactersData.filter(char => 
    char.name.toLowerCase().includes(search.toLowerCase()) && 
    char.isTainted === showTainted
  );

  return (
    <div className="flex flex-col gap-8 animate-fade-in relative w-full h-full">
      <CharacterModal 
        character={selectedCharacter} 
        isOpen={!!selectedCharacter} 
        onClose={() => setSelectedCharacter(null)} 
      />
      
      {/* Header Doodle */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b-2 border-text-ink border-dashed pb-4 mb-4">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-heading text-text-heading flex items-center gap-4 tracking-tight">
             <span className={cn("transition-colors duration-500 text-3xl", showTainted ? "text-accent-blood" : "text-text-ink")}>
               {showTainted ? <FaGhost /> : <FaUser />}
             </span>
             {showTainted ? 'Tainted' : 'Characters'}
          </h1>
          <p className="text-text-dim font-handwriting text-xl">
            {showTainted 
              ? "Twisted versions..." 
              : "Standard cast."}
            <span className="ml-2 opacity-60 text-sm font-sans">({filteredCharacters.length})</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-stretch sm:items-center">
           {/* Tainted Toggle - Hand-drawn buttons */}
           <div className="flex bg-transparent gap-2">
              <button
                onClick={() => setShowTainted(false)}
                className={cn(
                    "px-4 py-2 font-handwriting text-xl font-bold border-2 transition-all duration-300",
                    !showTainted 
                        ? "border-text-ink bg-text-ink text-bg-paper -rotate-2 scale-105" 
                        : "border-text-ink/30 text-text-dim hover:text-text-ink hover:border-text-ink"
                )}
              >
                 Normal
              </button>
              <button
                onClick={() => setShowTainted(true)}
                className={cn(
                    "px-4 py-2 font-handwriting text-xl font-bold border-2 transition-all duration-300",
                    showTainted 
                        ? "border-accent-blood bg-accent-blood text-white rotate-2 scale-105" 
                        : "border-text-ink/30 text-text-dim hover:text-accent-blood hover:border-accent-blood"
                )}
              >
                 Tainted
              </button>
           </div>

           <div className="relative w-full sm:w-64">
             <Input 
               icon={FaSearch} 
               placeholder="Search..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               onClear={() => setSearch('')}
             />
           </div>
        </div>
      </div>

      {/* Grid */}
      {filteredCharacters.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-8 pb-12">
          {filteredCharacters.map((char) => (
            <CharacterGridCard 
                key={char.id} 
                character={char} 
                onClick={setSelectedCharacter} 
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-text-dim opacity-50">
           <p className="text-3xl font-handwriting">No one is here...</p>
        </div>
      )}
    </div>
  );
}
