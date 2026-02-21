import { useState } from 'react';
import Banner from "../../components/banner/Banner";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import "./Characters.css";
import { charactersData } from "../../features/characters/data/charactersData";
import { CharacterTracker } from "../../features/characters/components/CharacterTracker";
import { GameCharacterCarousel } from "../../features/characters/components/GameCharacterCarousel";
import { CharacterModal } from "../../features/characters/components/CharacterModal";
import { cn } from "../../lib/utils";

function Characters() {
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [showTainted, setShowTainted] = useState(false);
  
  // Filter characters by tainted status
  const normalCharacters = charactersData.filter(c => !c.isTainted);
  const taintedCharacters = charactersData.filter(c => c.isTainted);
  
  const currentCharacters = showTainted ? taintedCharacters : normalCharacters;

  const handleCharacterSelect = (character) => {
    setSelectedCharacter(character);
  };

  const handleCloseModal = () => {
    setSelectedCharacter(null);
  };

  return (
    <>
      <Header />
      <Banner title={"Characters"} />
      
      {/* Tainted Toggle */}
      <div className="flex items-center justify-center gap-4 my-6 px-4">
        <button
          onClick={() => setShowTainted(false)}
          className={cn(
            "px-4 sm:px-6 py-2 font-heading text-sm sm:text-base uppercase tracking-wider transition-all border-2",
            !showTainted 
              ? "bg-black text-white border-black shadow-[3px_3px_0_rgba(0,0,0,0.3)]" 
              : "bg-transparent text-black border-black/30 hover:border-black"
          )}
        >
          Normal
        </button>
        <button
          onClick={() => setShowTainted(true)}
          className={cn(
            "px-4 sm:px-6 py-2 font-heading text-sm sm:text-base uppercase tracking-wider transition-all border-2",
            showTainted 
              ? "bg-red-900 text-white border-red-900 shadow-[3px_3px_0_rgba(0,0,0,0.3)]" 
              : "bg-transparent text-black border-black/30 hover:border-red-900 hover:text-red-900"
          )}
        >
          Tainted
        </button>
      </div>

      {/* Game-Style Character Carousel */}
      <div className={cn(
        "relative py-8 sm:py-12 transition-colors duration-500",
        showTainted ? "bg-gradient-to-b from-red-900/10 to-transparent" : ""
      )}>
        {/* Background atmosphere */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] md:w-[800px] md:h-[800px] rounded-full blur-[60px] sm:blur-[100px] opacity-20 transition-colors duration-500",
            showTainted ? "bg-red-900" : "bg-orange-200"
          )} />
        </div>
        
        <GameCharacterCarousel 
          characters={currentCharacters}
          onSelect={handleCharacterSelect}
        />
      </div>

      {/* Character Progress Tracker */}
      <CharacterTracker />

      {/* Character Modal */}
      {selectedCharacter && (
        <CharacterModal 
          character={selectedCharacter}
          onClose={handleCloseModal}
          isTainted={selectedCharacter.isTainted}
        />
      )}
      
      <Footer />
    </>
  );
}

export default Characters;
