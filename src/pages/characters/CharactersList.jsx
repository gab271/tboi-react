import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import FavoriteButton from '../../components/ui/FavoriteButton';
import { FaSearch, FaUser, FaGhost } from 'react-icons/fa';
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
    <div className="flex flex-col gap-8 animate-fade-in relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <CharacterModal 
        character={selectedCharacter} 
        isOpen={!!selectedCharacter} 
        onClose={() => setSelectedCharacter(null)} 
      />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/10 pb-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-serif font-black text-fg flex items-center gap-4 tracking-tight drop-shadow-sm">
             <span className={cn("transition-colors duration-500", showTainted ? "text-red-500" : "text-gold")}>
               {showTainted ? <FaGhost /> : <FaUser />}
             </span>
             {showTainted ? 'Tainted Characters' : 'Characters'}
          </h1>
          <p className="text-muted text-lg max-w-2xl">
            {showTainted 
              ? "Twisted versions of the standard cast. High risk, high reward." 
              : "The standard playable cast of The Binding of Isaac."}
            <span className="ml-2 opacity-60 text-sm">({filteredCharacters.length} found)</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-stretch sm:items-center">
           {/* Tainted Toggle */}
           <div className="bg-bg-0 p-1.5 rounded-xl border border-border shadow-inner flex relative overflow-hidden">
              <button
                onClick={() => setShowTainted(false)}
                className={cn(
                    "px-6 py-2.5 rounded-lg text-sm font-bold transition-all relative z-10 flex items-center gap-2",
                    !showTainted ? "bg-bg-2 text-fg shadow-md ring-1 ring-white/5" : "text-muted hover:text-fg hover:bg-white/5"
                )}
              >
                 <FaUser className={!showTainted ? "text-gold" : ""} /> Normal
              </button>
              <button
                onClick={() => setShowTainted(true)}
                className={cn(
                    "px-6 py-2.5 rounded-lg text-sm font-bold transition-all relative z-10 flex items-center gap-2",
                    showTainted ? "bg-red-950/40 text-red-200 shadow-md ring-1 ring-red-500/20" : "text-muted hover:text-red-300 hover:bg-white/5"
                )}
              >
                 <FaGhost className={showTainted ? "text-red-500" : ""} /> Tainted
              </button>
           </div>

           <div className="relative">
             <Input 
               icon={FaSearch} 
               placeholder="Search..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               onClear={() => setSearch('')}
               className="w-full sm:w-64 bg-bg-1 border-white/10 focus:border-gold/50"
             />
           </div>
        </div>
      </div>

      {/* Grid */}
      {filteredCharacters.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-8">
          {filteredCharacters.map((char) => (
            <Card 
              key={char.id} 
              variant="interactive"
              onClick={() => setSelectedCharacter(char)}
              className={cn(
                "group flex flex-col items-center p-6 gap-5 transition-all duration-300 cursor-pointer overflow-visible border-white/5 bg-gradient-to-br from-bg-1 to-bg-0 hover:-translate-y-1 hover:shadow-xl relative",
                char.isTainted ? "hover:border-red-900/50 hover:shadow-red-900/10" : "hover:border-gold/30 hover:shadow-gold/5"
              )}
            >
              {/* Favorite Button - Absolute Positioned */}
              <div 
                className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-bg-0/80 backdrop-blur-sm rounded-full p-1 shadow-sm border border-white/5 hover:bg-bg-2 transition-colors">
                  <FavoriteButton entityType="character" entityId={char.id} />
                </div>
              </div>

              <div className="w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center relative mt-2">
                 {/* Glow effect behind character */}
                 <div className={cn(
                    "absolute inset-0 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                    char.isTainted ? "bg-red-600/20" : "bg-gold/20"
                 )} />
                 
                 <img 
                   src={char.image} 
                   alt={char.name}
                   loading="lazy"
                   className={cn(
                       "w-full h-full object-contain drop-shadow-2xl z-10 filter transition-all duration-300",
                       "group-hover:scale-110",
                       char.isTainted && "sepia-[.3] hue-rotate-[-10deg]" 
                   )}
                   onError={(e) => {
                     e.target.onerror = null; 
                     e.target.src = 'https://placehold.co/100x100/1a1614/e6dcc8?text=?'; 
                   }}
                />
              </div>

              <div className="text-center w-full relative z-20">
                <h3 className={cn(
                    "font-bold font-serif text-2xl mb-1.5 transition-colors",
                    char.isTainted ? "text-red-200 group-hover:text-red-400" : "text-fg group-hover:text-gold"
                )}>
                    {char.name}
                </h3>
                <div className={cn(
                    "h-0.5 w-12 mx-auto rounded-full transition-all duration-300",
                    char.isTainted ? "bg-red-900/30 group-hover:w-24 group-hover:bg-red-500/50" : "bg-gold/20 group-hover:w-24 group-hover:bg-gold/50"
                )} />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-muted animate-pulse">
           <FaUser className="text-6xl mb-4 opacity-20" />
           <p className="text-xl font-serif">No characters found matching "{search}"</p>
        </div>
      )}
    </div>
  );
}
