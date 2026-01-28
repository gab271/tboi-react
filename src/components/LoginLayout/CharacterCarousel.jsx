import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

// Placeholder characters (In a real app, import from your assets)
// Using color blocks or external placeholders for now
const CHARACTERS = [
  { id: 'isaac', name: 'Isaac', color: '#f3dba9' },
  { id: 'magdalene', name: 'Magdalene', color: '#ecc5c5' },
  { id: 'cain', name: 'Cain', color: '#e4cdb4' },
  { id: 'judas', name: 'Judas', color: '#d8aa89' },
  { id: 'bluebaby', name: '???', color: '#9bb8d0' },
  { id: 'eve', name: 'Eve', color: '#7a7a7a' },
  { id: 'samson', name: 'Samson', color: '#c49a6c' },
  { id: 'azazel', name: 'Azazel', color: '#333' },
];

export const CharacterCarousel = () => {
    const navigate = useNavigate();
    const [activeIndex, setActiveIndex] = useState(0);

    const handleNext = () => {
        setActiveIndex((prev) => (prev + 1) % CHARACTERS.length);
    };

    const handlePrev = () => {
        setActiveIndex((prev) => (prev - 1 + CHARACTERS.length) % CHARACTERS.length);
    };

    // Get visible slice (centered logic)
    // We want 3 visible: Previous, Current, Next
    const prevIndex = (activeIndex - 1 + CHARACTERS.length) % CHARACTERS.length;
    const nextIndex = (activeIndex + 1) % CHARACTERS.length;
    
    // Helper to get character at wrapped index
    const getChar = (idx) => CHARACTERS[idx];

    return (
        <div className="relative w-full h-32 flex items-center justify-center mb-6 select-none">
            
            {/* Navigation Arrows (Hand-drawn style) */}
            <button 
                onClick={handlePrev}
                className="absolute left-0 z-20 p-2 text-text-dim hover:text-accent-blood hover:scale-110 transition-transform"
            >
                <FaArrowLeft size={24} />
            </button>
            <button 
                onClick={handleNext}
                className="absolute right-0 z-20 p-2 text-text-dim hover:text-accent-blood hover:scale-110 transition-transform"
            >
                <FaArrowRight size={24} />
            </button>

            {/* Carousel Track */}
            <div className="relative w-64 h-full flex items-center justify-center overflow-hidden">
                <div className="flex items-center justify-center gap-4">
                    
                    {/* Previous Character (Dimmed) */}
                    <CharSprite 
                        char={getChar(prevIndex)} 
                        status="inactive" 
                        onClick={handlePrev} 
                    />

                    {/* Active Character (Highlighted) */}
                    <div className="relative z-10 scale-125 transform transition-transform">
                        <CharSprite 
                            char={getChar(activeIndex)} 
                            status="active" 
                            onClick={() => navigate(`/wiki/characters/${getChar(activeIndex).id}`)}
                        />
                        
                        {/* THE RED CIRCLE (Selection Indicator) */}
                        <svg 
                            className="absolute -top-2 -left-2 w-[120%] h-[120%] pointer-events-none text-red-600 opacity-90 animate-pulse-slow"
                            viewBox="0 0 100 100"
                        >
                            <path 
                                d="M50, 10 a 40,40 0 1,0 1,0 z" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="4"
                                strokeDasharray="300"
                                strokeDashoffset="0"
                                style={{ filter: 'drop-shadow(0 0 2px rgba(220, 20, 60, 0.5))' }}
                            >
                                {/* Hand-drawn wiggle simulation via CSS in global or just path imperfecions */}
                           </path>
                           <path 
                                d="M45, 12 a 38,38 0 1,0 5,0" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2"
                                opacity="0.5"
                           />
                        </svg>
                    </div>

                    {/* Next Character (Dimmed) */}
                    <CharSprite 
                        char={getChar(nextIndex)} 
                        status="inactive" 
                        onClick={handleNext} 
                    />
                </div>
            </div>
            
            {/* Who am I? Text */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 font-handwriting text-text-dim text-sm opacity-60 rotate-2">
                Who am I?
            </div>
        </div>
    );
};

// Sub-component for the Sprite
const CharSprite = ({ char, status, onClick }) => {
    return (
        <div 
            onClick={onClick}
            className={cn(
                "relative w-16 h-16 rounded cursor-pointer transition-all duration-300 flex items-center justify-center",
                status === 'inactive' ? "opacity-40 scale-90 grayscale blur-[1px] hover:opacity-70" : "opacity-100"
            )}
            title={char.name}
        >
            {/* Placeholder for Sprite Image */}
            <div 
                className="w-12 h-14 rounded-sm shadow-sm"
                style={{ backgroundColor: char.color }}
            >
                {/* Simulated Face */}
                <div className="flex justify-center gap-2 mt-4">
                     <div className="w-1 h-1 bg-black rounded-full" />
                     <div className="w-1 h-1 bg-black rounded-full" />
                </div>
            </div>
            
            {/* Name Label (Only for active) */}
            {status === 'active' && (
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 font-pixel text-xs tracking-widest text-text-heading whitespace-nowrap">
                    {char.name}
                </div>
            )}
        </div>
    )
}
