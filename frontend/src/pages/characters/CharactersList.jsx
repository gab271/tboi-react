import { useState } from 'react';
import { cn } from '../../lib/utils';
import { charactersData } from '../../features/characters/data/charactersData';
import { CharacterModal } from '../../features/characters/components/CharacterModal';
import { CharacterWheel } from '../../features/characters/components/CharacterWheel';
import { FaGhost, FaUser } from 'react-icons/fa';

export function CharactersList() {
  const [showTainted, setShowTainted] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  // Filter based on Tainted Toggle
  const displayCharacters = charactersData.filter(char => char.isTainted === showTainted);

  return (
    <div className={cn(
        "relative w-full min-h-screen overflow-hidden transition-colors duration-1000 pb-0 mb-0",
        showTainted ? "bg-[#1a0505]" : "bg-[#151110]" // Dark Red vs Dark Floor
    )}>
      
      {/* Background Overlay Effects */ }
      <div className={cn(
          "absolute inset-0 pointer-events-none transition-opacity duration-1000",
          showTainted ? "opacity-100" : "opacity-0"
      )}>
            {/* Tainted Atmosphere */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-black/60 to-black"></div>
            <div className="absolute top-0 w-full h-full bg-noise opacity-10 mix-blend-overlay"></div>
      </div>

      <CharacterModal 
        character={selectedCharacter} 
        isOpen={!!selectedCharacter} 
        onClose={() => setSelectedCharacter(null)} 
      />
      
      <div className="relative z-10 flex flex-col h-full">
          
          {/* Header Switch */}
          <header className="relative z-50 flex flex-col items-center justify-center pt-8 sm:pt-12 pb-4 sm:pb-6 gap-2 sm:gap-3">
              <h1 className={cn(
                  "font-heading text-lg sm:text-2xl md:text-4xl tracking-widest uppercase transition-all duration-500 drop-shadow-md text-center",
                  showTainted ? "text-red-600 scale-105" : "text-[#d4c5a9]"
              )}>
                  WHO AM I?
              </h1>
              
              {/* Custom Toggle Switch */}
              <div className="flex items-center gap-2 sm:gap-4 p-0.5 sm:p-1 bg-black/40 rounded-full border border-white/10 backdrop-blur-sm">
                  <button
                    onClick={() => setShowTainted(false)}
                    className={cn(
                        "flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-1 sm:py-2 rounded-full font-heading text-xs sm:text-sm transition-all duration-300",
                        !showTainted ? "bg-[#d4c5a9] text-black shadow-lg scale-105" : "text-gray-500 hover:text-gray-300"
                    )}
                  >
                     <FaUser /> NORMAL
                  </button>
                  <button
                    onClick={() => setShowTainted(true)}
                    className={cn(
                        "flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-1 sm:py-2 rounded-full font-heading text-xs sm:text-sm transition-all duration-300",
                        showTainted ? "bg-red-900 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)] scale-105" : "text-gray-500 hover:text-gray-300"
                    )}
                  >
                     <FaGhost /> TAINTED
                  </button>
              </div>
          </header>

          {/* The Wheel */}
          <main className="flex-1 flex items-center justify-center">
               <CharacterWheel 
                  characters={displayCharacters} 
                  isTainted={showTainted}
                  onSelect={setSelectedCharacter}
               />
          </main>
      </div>
    </div>
  );
}
