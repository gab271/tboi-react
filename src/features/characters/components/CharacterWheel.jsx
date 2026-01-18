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
        <div className="relative w-full h-[500px] flex items-center justify-center perspective-[1200px] overflow-hidden -mt-12">
            
            {/* Background Atmosphere Circle */}
            <div className={cn(
                "absolute w-[600px] h-[600px] rounded-full blur-[80px] -z-10 transition-colors duration-1000",
                isTainted ? "bg-red-900/20" : "bg-yellow-500/5"
            )}></div>

            {/* Navigation Buttons (Floating) */}
            <button 
                onClick={handlePrev}
                className="absolute left-2 md:left-10 z-[60] text-3xl md:text-5xl text-white/40 hover:text-white hover:scale-110 transition-all drop-shadow-md p-4"
            >
                <FaChevronLeft />
            </button>
            <button 
                onClick={handleNext}
                className="absolute right-2 md:right-10 z-[60] text-3xl md:text-5xl text-white/40 hover:text-white hover:scale-110 transition-all drop-shadow-md p-4"
            >
                <FaChevronRight />
            </button>

            {/* 3D Wheel Container */}
            <div className="flex items-center justify-center w-full h-full preserve-3d">
                <AnimatePresence mode="popLayout">
                    {visibleItems.map(({ index, offset }) => {
                        const char = characters[index];
                        if (!char) return null; // Safety

                        return (
                            <motion.div
                                key={`${isTainted ? 't' : 'n'}-${char.id}`} // Force remount on tainted switch
                                initial={false}
                                animate={{
                                    x: offset * 280, // Horizontal spacing (tightened)
                                    z: Math.abs(offset) * -150, // Depth
                                    scale: offset === 0 ? 1 : 0.85,
                                    opacity: offset === 0 ? 1 : 1 - Math.abs(offset) * 0.3,
                                    rotateY: offset * 25, // 3D Rotation
                                    filter: offset === 0 ? 'blur(0px) brightness(1)' : 'blur(2px) brightness(0.6)'
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
                                    zIndex: 10 - Math.abs(offset),
                                    // Ensure clicks work appropriately
                                    pointerEvents: offset === 0 ? 'auto' : 'none' 
                                }}
                                onClick={() => {
                                    if (offset !== 0) {
                                       if (offset > 0) handleNext();
                                       else handlePrev();
                                    }
                                }}
                            >
                                <div className={cn("relative transition-all duration-300", offset !== 0 && "cursor-pointer")}>
                                    <CharacterCard 
                                        character={char} 
                                        isActive={offset === 0} 
                                        isTainted={isTainted}
                                        onSelect={() => onSelect && onSelect(char)}
                                    />
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
            
        </div>
    );
};
