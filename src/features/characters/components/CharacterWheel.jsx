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
        
        // Indices relative to Active: -2, -1, 0, 1, 2
        const result = [];
        for (let i = -2; i <= 2; i++) {
            const index = (activeIndex + i + len) % len;
            result.push({ index, offset: i });
        }
        return result;
    };

    const visibleItems = getVisibleIndices();

    return (
        <div className="relative w-full h-[600px] flex items-center justify-center perspective-[1200px] overflow-hidden">
            
            {/* Background Atmosphere Circle */}
            <div className={cn(
                "absolute w-[800px] h-[800px] rounded-full blur-[100px] -z-10 transition-colors duration-1000",
                isTainted ? "bg-red-900/20" : "bg-gold/10"
            )}></div>

            {/* Navigation Buttons (Floating) */}
            <button 
                onClick={handlePrev}
                className="absolute left-4 md:left-20 z-50 text-4xl md:text-6xl text-white/50 hover:text-white hover:scale-110 transition-all drop-shadow-lg"
            >
                <FaChevronLeft />
            </button>
            <button 
                onClick={handleNext}
                className="absolute right-4 md:right-20 z-50 text-4xl md:text-6xl text-white/50 hover:text-white hover:scale-110 transition-all drop-shadow-lg"
            >
                <FaChevronRight />
            </button>

            {/* 3D Wheel Container */}
            <div className="relative flex items-center justify-center w-full h-full">
                <AnimatePresence mode="popLayout">
                    {visibleItems.map(({ index, offset }) => {
                        const char = characters[index];
                        if (!char) return null; // Safety

                        return (
                            <motion.div
                                key={`${isTainted ? 't' : 'n'}-${char.id}`} // Force remount on tainted switch
                                initial={false}
                                animate={{
                                    x: offset * 320, // Horizontal spacing
                                    z: Math.abs(offset) * -200, // Depth
                                    scale: offset === 0 ? 1 : 0.85,
                                    opacity: offset === 0 ? 1 : 1 - Math.abs(offset) * 0.3,
                                    rotateY: offset * 25, // 3D Rotation
                                    filter: offset === 0 ? 'blur(0px) brightness(1)' : 'blur(2px) brightness(0.6)'
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 200,
                                    damping: 30
                                }}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 origin-center"
                                style={{
                                    zIndex: 10 - Math.abs(offset)
                                }}
                                onClick={() => {
                                    if (offset !== 0) {
                                       if (offset > 0) handleNext();
                                       else handlePrev();
                                    } else {
                                        onSelect && onSelect(char);
                                    }
                                }}
                            >
                                <CharacterCard 
                                    character={char} 
                                    isActive={offset === 0} 
                                    isTainted={isTainted}
                                />
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
            
            {/* Active Character Name/Flavor Floating Bottom */}
            <div className="absolute bottom-10 text-center z-40 w-full px-4">
                 <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-2"
                 >
                     <span className={cn(
                         "text-sm font-pixel tracking-[0.3em] uppercase opacity-80", 
                         isTainted ? "text-red-300" : "text-[#d4c5a9]"
                     )}>
                         Current Selection
                     </span>
                     {/* Could act as 'Select' button on mobile */}
                     <button 
                        onClick={() => onSelect && onSelect(characters[activeIndex])}
                        className={cn(
                            "mt-2 px-8 py-2 border-2 uppercase font-heading text-lg tracking-wider hover:bg-white hover:text-black transition-colors",
                            isTainted ? "border-red-900 text-red-100 bg-red-900/20" : "border-[#d4c5a9] text-[#d4c5a9] bg-black/20"
                        )}
                     >
                        View Details
                     </button>
                 </motion.div>
            </div>

        </div>
    );
};
