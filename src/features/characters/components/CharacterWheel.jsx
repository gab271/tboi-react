import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { CharacterCard } from './CharacterCard';
import { cn } from '../../../lib/utils';

export const CharacterWheel = ({ characters, isTainted, onSelect }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    // Ensure activeIndex stays within bounds when list changes
    useEffect(() => {
        setActiveIndex(0);
    }, [isTainted, characters.length]);

    const handleNext = () => {
        setActiveIndex((prev) => (prev + 1) % characters.length);
    };

    const handlePrev = () => {
        setActiveIndex((prev) => (prev - 1 + characters.length) % characters.length);
    };
    
    // Carousel Window Logic
    // We want to show: [Prev, Active, Next]
    // But realistically mostly focus on Active. 
    // Let's render 5 items centered around activeIndex for specific transforms.
    
    const getVisibleIndices = () => {
        const len = characters.length;
        if (len === 0) return [];
        
        // Mobile optimization: fewer items in arc to avoid clutter
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
        const range = isMobile ? 1 : 3;

        // Indices relative to Active
        const result = [];
        for (let i = -range; i <= range; i++) {
            const index = (activeIndex + i + len) % len;
            result.push({ index, offset: i });
        }
        return result;
    };

    const visibleItems = getVisibleIndices();

    return (
        <div className="relative w-full h-[400px] md:h-[600px] flex items-center justify-center perspective-[1000px] overflow-visible mt-4 md:mt-8">
            
            {/* Background Atmosphere Circle */}
            <div className={cn(
                "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[800px] md:h-[800px] rounded-full blur-[60px] md:blur-[100px] -z-10 transition-colors duration-1000",
                isTainted ? "bg-red-900/30" : "bg-orange-100/10"
            )}></div>

            {/* Navigation Buttons (Floating) */}
            <button 
                onClick={handlePrev}
                className="absolute left-0 md:left-20 z-[60] text-3xl md:text-5xl text-white/40 hover:text-white hover:scale-110 transition-all drop-shadow-md p-4"
            >
                <FaChevronLeft />
            </button>
            <button 
                onClick={handleNext}
                className="absolute right-0 md:right-20 z-[60] text-3xl md:text-5xl text-white/40 hover:text-white hover:scale-110 transition-all drop-shadow-md p-4"
            >
                <FaChevronRight />
            </button>

            {/* 3D Wheel Container */}
            <div className="relative w-full max-w-5xl h-full flex items-center justify-center preserve-3d">
                <AnimatePresence mode="popLayout">
                    {visibleItems.map(({ index, offset }) => {
                        const char = characters[index];
                        if (!char) return null; // Safety

                        const isCenter = offset === 0;
                        
                        // Isaac Style Menu: Center is front, others are in a tight arc behind.
                        
                        // Responsive Spacing
                        const spacing = typeof window !== 'undefined' && window.innerWidth < 768 ? 60 : 120;
                        
                        const xPos = offset * spacing; // Tight Spacing on mobile
                        const zPos = isCenter ? 0 : -300 - Math.abs(offset) * 100; // Deep Z
                        const yPos = isCenter ? 0 : -50 + Math.abs(offset) * 20; // Slight curve up/down
                        const scale = isCenter ? (typeof window !== 'undefined' && window.innerWidth < 768 ? 1.0 : 1.3) : 0.6; // Smaller center on mobile
                        const opacity = isCenter ? 1 : 0.6 - Math.abs(offset) * 0.1;
                        const rotateY = offset * 15; // Face inwards slightly

                        return (
                            <motion.div
                                key={`${isTainted ? 't' : 'n'}-${char.id}`} // Force remount on tainted switch
                                initial={false}
                                animate={{
                                    x: xPos,
                                    y: yPos,
                                    z: zPos,
                                    scale: scale,
                                    opacity: opacity,
                                    rotateY: rotateY,
                                    filter: isCenter ? 'grayscale(0%) brightness(1)' : 'grayscale(100%) brightness(0.5) contrast(1.2)'
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 260,
                                    damping: 20
                                }}
                                className="absolute top-1/2 left-1/2 origin-center"
                                style={{
                                    // Fix centering: translate -50% -50% to center the element on the point
                                    transform: `translate(-50%, -50%)`,
                                    zIndex: 50 - Math.abs(offset),
                                    pointerEvents: isCenter ? 'auto' : 'auto', 
                                    cursor: isCenter ? 'default' : 'pointer'
                                }}
                                onClick={() => {
                                    if (!isCenter) {
                                       if (offset > 0) handleNext();
                                       else handlePrev();
                                    }
                                }}
                            >
                                <div className={cn("relative transition-all duration-300")}>
                                    {isCenter ? (
                                        <div className="transform scale-125">
                                            <CharacterCard 
                                                character={char} 
                                                isActive={true} 
                                                isTainted={isTainted}
                                                onSelect={() => onSelect && onSelect(char)}
                                            />
                                        </div>
                                    ) : (
                                        /* Side Characters: Just Sprites/Heads */
                                        <div className="w-24 h-24 flex items-center justify-center filter drop-shadow-xl">
                                             {char.image ? (
                                                <img 
                                                    src={char.image} 
                                                    alt={char.name}
                                                    className="w-full h-full object-contain pixelated"
                                                /> 
                                             ) : (
                                                 <span className="text-4xl text-white/50">?</span>
                                             )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
            
        </div>
    );
};
