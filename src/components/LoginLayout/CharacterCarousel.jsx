import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// Characters with real sprites
const CHARACTERS = [
  { id: 'isaac', name: 'Isaac', sprite: '/sprites/0_Characters/0_Vanilla/Isaac.png' },
  { id: 'magdalene', name: 'Magdalene', sprite: '/sprites/0_Characters/0_Vanilla/Magdalene.png' },
  { id: 'cain', name: 'Cain', sprite: '/sprites/0_Characters/0_Vanilla/Cain.png' },
  { id: 'judas', name: 'Judas', sprite: '/sprites/0_Characters/0_Vanilla/Judas.png' },
  { id: 'bluebaby', name: '???', sprite: '/sprites/0_Characters/0_Vanilla/Blue Baby.png' },
  { id: 'eve', name: 'Eve', sprite: '/sprites/0_Characters/0_Vanilla/Eve.png' },
  { id: 'samson', name: 'Samson', sprite: '/sprites/0_Characters/0_Vanilla/Samson.png' },
  { id: 'azazel', name: 'Azazel', sprite: '/sprites/0_Characters/0_Vanilla/Azazel.png' },
  { id: 'lazarus', name: 'Lazarus', sprite: '/sprites/0_Characters/0_Vanilla/Lazarus.png' },
  { id: 'eden', name: 'Eden', sprite: '/sprites/0_Characters/0_Vanilla/Eden.png' },
  { id: 'lost', name: 'The Lost', sprite: '/sprites/0_Characters/0_Vanilla/The Lost.png' },
  { id: 'lilith', name: 'Lilith', sprite: '/sprites/0_Characters/0_Vanilla/Lilith.png' },
  { id: 'keeper', name: 'Keeper', sprite: '/sprites/0_Characters/0_Vanilla/Keeper.png' },
  { id: 'apollyon', name: 'Apollyon', sprite: '/sprites/0_Characters/0_Vanilla/Apollyon.png' },
  { id: 'forgotten', name: 'The Forgotten', sprite: '/sprites/0_Characters/0_Vanilla/The Forgotten.png' },
  { id: 'bethany', name: 'Bethany', sprite: '/sprites/0_Characters/0_Vanilla/Bethany.png' },
];

export const CharacterCarousel = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    // Auto-rotate every 4 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setDirection(1);
            setActiveIndex((prev) => (prev + 1) % CHARACTERS.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const handleNext = () => {
        setDirection(1);
        setActiveIndex((prev) => (prev + 1) % CHARACTERS.length);
    };

    const handlePrev = () => {
        setDirection(-1);
        setActiveIndex((prev) => (prev - 1 + CHARACTERS.length) % CHARACTERS.length);
    };

    const prevIndex = (activeIndex - 1 + CHARACTERS.length) % CHARACTERS.length;
    const nextIndex = (activeIndex + 1) % CHARACTERS.length;
    
    const getChar = (idx) => CHARACTERS[idx];
    const currentChar = getChar(activeIndex);

    return (
        <div className="relative w-full flex flex-col items-center justify-center select-none">
            
            {/* Who am I? Label */}
            <div className="font-handwriting text-[#5c4a32]/60 text-sm mb-2 italic">
                Who am I?
            </div>

            {/* Carousel Container */}
            <div className="relative w-full h-28 flex items-center justify-center">
                
                {/* Navigation Arrows */}
                <button 
                    onClick={handlePrev}
                    className="absolute left-4 z-20 p-2 text-[#5c4a32]/40 hover:text-[#8a1c1c] hover:scale-125 transition-all"
                >
                    <FaChevronLeft size={20} />
                </button>
                <button 
                    onClick={handleNext}
                    className="absolute right-4 z-20 p-2 text-[#5c4a32]/40 hover:text-[#8a1c1c] hover:scale-125 transition-all"
                >
                    <FaChevronRight size={20} />
                </button>

                {/* Characters Display */}
                <div className="relative flex items-center justify-center gap-6">
                    
                    {/* Previous Character */}
                    <div 
                        onClick={handlePrev}
                        className="w-14 h-14 flex items-center justify-center opacity-30 grayscale hover:opacity-50 cursor-pointer transition-all"
                    >
                        <img 
                            src={getChar(prevIndex).sprite} 
                            alt={getChar(prevIndex).name}
                            className="w-full h-full object-contain pixelated"
                        />
                    </div>

                    {/* Active Character with Red Circle */}
                    <div className="relative">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentChar.id}
                                initial={{ opacity: 0, scale: 0.8, y: direction > 0 ? 20 : -20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, y: direction > 0 ? -20 : 20 }}
                                transition={{ duration: 0.3 }}
                                className="relative w-20 h-20 flex items-center justify-center z-10"
                            >
                                <motion.img 
                                    src={currentChar.sprite} 
                                    alt={currentChar.name}
                                    className="w-full h-full object-contain pixelated drop-shadow-lg"
                                    animate={{ y: [0, -4, 0] }}
                                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                />
                            </motion.div>
                        </AnimatePresence>
                        
                        {/* Hand-drawn Red Selection Circle */}
                        <svg 
                            className="absolute -inset-3 w-[calc(100%+24px)] h-[calc(100%+24px)] pointer-events-none"
                            viewBox="0 0 100 100"
                        >
                            <ellipse 
                                cx="50" cy="50" rx="42" ry="44"
                                fill="none" 
                                stroke="#b91c1c"
                                strokeWidth="3"
                                strokeLinecap="round"
                                style={{ 
                                    filter: 'drop-shadow(0 0 3px rgba(185, 28, 28, 0.4))',
                                }}
                                strokeDasharray="8 4"
                            />
                            <ellipse 
                                cx="50" cy="50" rx="44" ry="42"
                                fill="none" 
                                stroke="#dc2626"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                opacity="0.8"
                            />
                        </svg>
                    </div>

                    {/* Next Character */}
                    <div 
                        onClick={handleNext}
                        className="w-14 h-14 flex items-center justify-center opacity-30 grayscale hover:opacity-50 cursor-pointer transition-all"
                    >
                        <img 
                            src={getChar(nextIndex).sprite} 
                            alt={getChar(nextIndex).name}
                            className="w-full h-full object-contain pixelated"
                        />
                    </div>
                </div>
            </div>

            {/* Character Name */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentChar.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-2 font-pixel text-sm text-[#1a1a1a] tracking-widest uppercase"
                >
                    {currentChar.name}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
