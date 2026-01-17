import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { charactersData } from '../data/charactersData';

// Constants for Completion Marks (12 standard marks)
// In a real app, these would be linked to specific unlock IDs.
// Added 'symbol' property for generic CSS fallback.
const COMPLETION_MARKS = [
  { id: 'heart', name: "Mom's Heart", label: "Heart", symbol: "❤️" },
  { id: 'isaac', name: "Isaac", label: "Cross", symbol: "✝" },
  { id: 'boss_rush', name: "Boss Rush", label: "Star", symbol: "★" },
  { id: 'satan', name: "Satan", label: "Inverted Cross", symbol: "⛧" },
  { id: 'blue_baby', name: "??? (Blue Baby)", label: "Polaroid", symbol: "P" },
  { id: 'lamb', name: "The Lamb", label: "Negative", symbol: "N" },
  { id: 'mega_satan', name: "Mega Satan", label: "Brimstone", symbol: "∞" },
  { id: 'greed', name: "Greed Mode", label: "Cent", symbol: "¢" }, 
  { id: 'hush', name: "Hush", label: "Hush", symbol: "H" },
  { id: 'delirium', name: "Delirium", label: "Wrinkled Paper", symbol: "D" },
  { id: 'mother', name: "Mother", label: "Knife", symbol: "M" },
  { id: 'beast', name: "The beast", label: "Dad's Note", symbol: "B" }
];

// Placeholder for sprite URLs
const MARK_SPRITES = {
    heart: "https://bindingofisaacrebirth.fandom.com/wiki/Special:FilePath/Completion_Marks_Mom's_Heart.png",
    isaac: "https://bindingofisaacrebirth.fandom.com/wiki/Special:FilePath/Completion_Marks_Isaac.png",
    boss_rush: "https://bindingofisaacrebirth.fandom.com/wiki/Special:FilePath/Completion_Marks_Boss_Rush.png",
    satan: "https://bindingofisaacrebirth.fandom.com/wiki/Special:FilePath/Completion_Marks_Satan.png",
    blue_baby: "https://bindingofisaacrebirth.fandom.com/wiki/Special:FilePath/Completion_Marks_Blue_Baby.png",
    lamb: "https://bindingofisaacrebirth.fandom.com/wiki/Special:FilePath/Completion_Marks_The_Lamb.png",
    mega_satan: "https://bindingofisaacrebirth.fandom.com/wiki/Special:FilePath/Completion_Marks_Mega_Satan.png",
    greed: "https://bindingofisaacrebirth.fandom.com/wiki/Special:FilePath/Completion_Marks_Ultra_Greed.png",
    hush: "https://bindingofisaacrebirth.fandom.com/wiki/Special:FilePath/Completion_Marks_Hush.png",
    delirium: "https://bindingofisaacrebirth.fandom.com/wiki/Special:FilePath/Completion_Marks_Delirium.png",
    mother: "https://bindingofisaacrebirth.fandom.com/wiki/Special:FilePath/Completion_Marks_Mother.png",
    beast: "https://bindingofisaacrebirth.fandom.com/wiki/Special:FilePath/Completion_Marks_The_Beast.png"
};

const STORAGE_KEY_PREFIX = 'tboi_tracker_';

export function CharacterTracker() {
    const [selectedCharId, setSelectedCharId] = useState(charactersData[0]?.id || 'isaac');
    const [progress, setProgress] = useState({}); // { [charId]: { [markId]: boolean } }

    // Load from localStorage on mount
    useEffect(() => {
        const loadedProgress = {};
        charactersData.forEach(char => {
            const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}${char.id}`);
            if (saved) {
                try {
                    loadedProgress[char.id] = JSON.parse(saved);
                } catch (e) {
                    console.error("Failed to parse progress", e);
                }
            } else {
                 loadedProgress[char.id] = {};
            }
        });
        setProgress(loadedProgress);
    }, []);

    const toggleMark = (charId, markId) => {
        if (!charId) return;

        setProgress(prev => {
            const charProgress = prev[charId] || {};
            const isCompleted = !!charProgress[markId];
            const newCharProgress = { ...charProgress, [markId]: !isCompleted };
            
            // Save immediately (side effect in event handler)
            localStorage.setItem(`${STORAGE_KEY_PREFIX}${charId}`, JSON.stringify(newCharProgress));

            return {
                ...prev,
                [charId]: newCharProgress
            };
        });
        
        // Optional: Play sound or trigger feedback here
    };

    const selectedChar = charactersData.find(c => c.id === selectedCharId);

    if (!selectedChar) return <div>Loading...</div>;

    return (
        <section className="w-full max-w-5xl mx-auto my-12 p-4">
             <h2 className="text-3xl font-display text-center text-text-ink mb-8 tracking-widest uppercase" style={{ fontFamily: 'Upheaval, sans-serif' }}>
                Completion Tracker
             </h2>
             
             {/* Character Selector Strip */}
             <div className="flex overflow-x-auto pb-6 mb-8 gap-4 px-4 snap-x justify-start md:justify-center scrollbar-thin scrollbar-thumb-accent-blood scrollbar-track-transparent">
                {charactersData.map(char => (
                    <button
                        key={char.id}
                        onClick={() => setSelectedCharId(char.id)}
                        className={`
                            relative flex-shrink-0 w-16 h-16 rounded-full border-2 transition-all duration-300
                            ${selectedCharId === char.id 
                                ? 'border-accent-blood scale-110 shadow-[0_0_15px_rgba(255,0,0,0.4)] bg-bg-paper' 
                                : 'border-transparent hover:border-text-ink/30 opacity-70 hover:opacity-100 grayscale hover:grayscale-0'
                            }
                        `}
                    >
                        <img 
                            src={char.image} 
                            alt={char.name} 
                            className="w-full h-full object-contain p-1"
                        />
                         {selectedCharId === char.id && (
                            <motion.div 
                                layoutId="active-indicator"
                                className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-accent-blood rounded-full"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* The Post-it Note Container */}
            <div className="relative w-full max-w-lg mx-auto transform rotate-1 transition-transform duration-500 hover:rotate-0">
                {/* Red Tack */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-4 h-4 rounded-full bg-red-700 shadow-md border border-red-900"></div>

                {/* Paper Body */}
                <div className="bg-[#fdfac8] text-black/80 p-8 pt-12 shadow-xl relative min-h-[400px]" style={{ clipPath: 'polygon(2% 0%, 98% 2%, 100% 100%, 0% 98%)' }}>
                    
                    {/* Character Name Title */}
                    <div className="text-center mb-6 border-b-2 border-black/10 pb-2 border-dashed">
                        <h3 className="text-2xl font-bold uppercase tracking-widest" style={{ fontFamily: 'Upheaval, cursive' }}>
                            {selectedChar.name}
                        </h3>
                         <p className="text-xs text-black/50 font-handwriting">Completion Marks</p>
                    </div>

                    {/* The Grid (3x4) */}
                    <div className="grid grid-cols-3 gap-4 auto-rows-fr justify-items-center">
                        {COMPLETION_MARKS.map((mark) => {
                            const isCompleted = progress[selectedCharId]?.[mark.id];

                            return (
                                <div key={mark.id} className="relative group">
                                     {/* Tooltip */}
                                     <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-white text-black text-xs p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 border border-gray-300 font-handwriting text-center">
                                         <strong className="block border-b border-gray-200 pb-1 mb-1">{mark.name}</strong>
                                         Unlocks: <span className="text-accent-blood">Item #{Math.floor(Math.random() * 500) + 1}</span>
                                     </div>

                                    <button
                                        onClick={() => toggleMark(selectedCharId, mark.id)}
                                        className={`
                                            w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center transition-all duration-200 border-2 rounded-sm
                                            ${isCompleted 
                                                ? 'border-transparent opacity-100' 
                                                : 'border-text-ink/20 opacity-40 grayscale hover:opacity-60 bg-text-ink/5 border-dashed'
                                            }
                                        `}
                                        title={mark.name}
                                    >
                                        {/* CSS Fallback or Image */}
                                        <div className={`
                                            w-full h-full bg-contain bg-center bg-no-repeat flex items-center justify-center
                                            ${isCompleted ? 'filter-none drop-shadow-[0_2px_4px_rgba(200,0,0,0.5)]' : ''}
                                        `}
                                        style={{ 
                                            // Ensure sprite URL is attempted, but we use an onError in a real img or just fallback to text if bg box
                                            backgroundImage: isCompleted ? `url('${MARK_SPRITES[mark.id]}')` : 'none',
                                        }}
                                        >
                                            {/* Fallback Text/Symbol always visible if image fails or isn't completed to show what it is */}
                                            { (!isCompleted) && (
                                                <span className="text-2xl font-bold text-text-ink/30 select-none">
                                                    {mark.symbol}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default CharacterTracker;
