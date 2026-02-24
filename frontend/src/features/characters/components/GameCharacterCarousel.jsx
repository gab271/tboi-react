import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FaChevronLeft, FaChevronRight, FaHeart, FaBomb, FaKey } from 'react-icons/fa';
import { cn } from '../../../lib/utils';

export const GameCharacterCarousel = ({ characters, onSelect }) => {
    const { t } = useTranslation();
    const [activeIndex, setActiveIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    const handleNext = useCallback(() => {
        setDirection(1);
        setActiveIndex((prev) => (prev + 1) % characters.length);
    }, [characters.length]);

    const handlePrev = useCallback(() => {
        setDirection(-1);
        setActiveIndex((prev) => (prev - 1 + characters.length) % characters.length);
    }, [characters.length]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'Enter') onSelect && onSelect(characters[activeIndex]);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleNext, handlePrev, activeIndex, characters, onSelect]);

    // Get visible characters (prev, current, next)
    const getVisibleCharacters = () => {
        const len = characters.length;
        if (len === 0) return [];
        
        const prevIndex = (activeIndex - 1 + len) % len;
        const nextIndex = (activeIndex + 1) % len;
        
        return [
            { char: characters[prevIndex], position: 'left', index: prevIndex },
            { char: characters[activeIndex], position: 'center', index: activeIndex },
            { char: characters[nextIndex], position: 'right', index: nextIndex },
        ];
    };

    const visibleChars = getVisibleCharacters();
    const currentChar = characters[activeIndex];

    if (!currentChar) return null;

    return (
        <div className="relative w-full max-w-5xl mx-auto px-2 sm:px-4 py-2 sm:py-4 md:py-8">
            
            {/* Main Title - "WHO AM I?" style like the game */}
            <div className="text-center mb-2 sm:mb-4 md:mb-8">
                <div className="inline-block relative">
                    {/* Paper note effect */}
                    <div className="relative bg-[#f4e4bc] px-4 sm:px-6 md:px-10 py-2 sm:py-3 md:py-4 shadow-lg transform -rotate-1 border-2 border-black/10">
                        {/* Pin */}
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-red-700 rounded-full border-2 border-red-900 shadow-md z-10" />
                        <h2 className="font-heading text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-black tracking-wider">
                            WHO AM I ?
                        </h2>
                    </div>
                </div>
            </div>

            {/* Carousel Container */}
            <div className="relative flex items-center justify-center min-h-[220px] sm:min-h-[280px] md:min-h-[380px] lg:min-h-[450px]">
                
                {/* Left Navigation Arrow */}
                <button 
                    onClick={handlePrev}
                    className="absolute left-0 sm:left-2 md:left-4 z-30 p-2 sm:p-3 text-black/50 hover:text-black hover:scale-125 transition-all"
                    aria-label={t('characters.previousCharacter')}
                >
                    <FaChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
                </button>

                {/* Characters Display */}
                <div className="relative w-full flex items-center justify-center perspective-1000">
                    <AnimatePresence mode="popLayout" initial={false}>
                        {visibleChars.map(({ char, position, index: _index }) => {
                            const isCenter = position === 'center';
                            const isLeft = position === 'left';
                            const isRight = position === 'right';

                            // Responsive positioning
                            let xOffset = 0;
                            let scale = 1;
                            let opacity = 1;
                            let zIndex = 10;

                            if (isCenter) {
                                xOffset = 0;
                                scale = 1;
                                opacity = 1;
                                zIndex = 20;
                            } else if (isLeft) {
                                // More responsive offsets
                                xOffset = typeof window !== 'undefined' && window.innerWidth < 640 ? -60 : (window.innerWidth < 1024 ? -120 : -180);
                                scale = typeof window !== 'undefined' && window.innerWidth < 640 ? 0.4 : 0.55;
                                opacity = 0.5;
                                zIndex = 10;
                            } else if (isRight) {
                                xOffset = typeof window !== 'undefined' && window.innerWidth < 640 ? 60 : (window.innerWidth < 1024 ? 120 : 180);
                                scale = typeof window !== 'undefined' && window.innerWidth < 640 ? 0.4 : 0.55;
                                opacity = 0.5;
                                zIndex = 10;
                            }

                            return (
                                <motion.div
                                    key={`${char.id}-${position}`}
                                    initial={{ 
                                        x: direction > 0 ? 200 : -200,
                                        opacity: 0,
                                        scale: 0.5
                                    }}
                                    animate={{ 
                                        x: xOffset,
                                        opacity: opacity,
                                        scale: scale,
                                        filter: isCenter ? 'grayscale(0%)' : 'grayscale(100%)',
                                    }}
                                    exit={{ 
                                        x: direction > 0 ? -200 : 200,
                                        opacity: 0,
                                        scale: 0.5
                                    }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 30
                                    }}
                                    className="absolute cursor-pointer"
                                    style={{ zIndex }}
                                    onClick={() => {
                                        if (isLeft) handlePrev();
                                        else if (isRight) handleNext();
                                        else if (isCenter) onSelect && onSelect(char);
                                    }}
                                >
                                    {isCenter ? (
                                        /* Center character with full paper card */
                                        <div className="relative">
                                            {/* The Paper Sheet - Game Style */}
                                            <div 
                                                className="relative w-[160px] sm:w-[200px] md:w-[260px] lg:w-[300px] bg-[#f4e4bc] shadow-xl p-2 sm:p-3 md:p-4 lg:p-6"
                                                style={{
                                                    clipPath: `polygon(
                                                        2% 0%, 98% 0%, 100% 2%, 99% 98%, 
                                                        92% 100%, 85% 98%, 78% 100%, 70% 99%, 62% 100%, 
                                                        55% 99%, 48% 100%, 40% 98%, 32% 100%, 25% 99%, 
                                                        18% 100%, 10% 98%, 0% 100%
                                                    )`
                                                }}
                                            >
                                                {/* Paper texture */}
                                                <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none" />
                                                
                                                {/* Character sprite */}
                                                <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 mx-auto mb-1 sm:mb-2 md:mb-4">
                                                    {/* Shadow under sprite */}
                                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 sm:w-16 md:w-20 h-2 sm:h-3 md:h-4 bg-black/20 blur-md rounded-[100%]" />
                                                    
                                                    {char.image ? (
                                                        <motion.img 
                                                            src={char.image} 
                                                            alt={char.name}
                                                            className="w-full h-full object-contain pixelated drop-shadow-lg"
                                                            animate={{ y: [0, -5, 0] }}
                                                            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                                                            draggable={false}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <span className="text-4xl text-gray-400">?</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        /* Side characters - just sprites */
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center">
                                            {char.image ? (
                                                <img 
                                                    src={char.image} 
                                                    alt={char.name}
                                                    className="w-full h-full object-contain pixelated drop-shadow-lg opacity-60"
                                                    draggable={false}
                                                />
                                            ) : (
                                                <span className="text-2xl text-gray-400">?</span>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {/* Right Navigation Arrow */}
                <button 
                    onClick={handleNext}
                    className="absolute right-0 sm:right-2 md:right-4 z-30 p-2 sm:p-3 text-black/50 hover:text-black hover:scale-125 transition-all"
                    aria-label={t('characters.nextCharacter')}
                >
                    <FaChevronRight className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
                </button>
            </div>

            {/* Character Info Panel - Below the carousel */}
            <motion.div 
                key={currentChar.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="relative mt-2 sm:mt-4 text-center"
            >
                {/* Character Name with Arrows */}
                <div className="flex items-center justify-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <span className="text-black/30 text-lg sm:text-2xl font-heading">◀</span>
                    <h3 className="font-heading text-xl sm:text-2xl md:text-3xl lg:text-4xl text-black uppercase tracking-widest">
                        {currentChar.name}
                    </h3>
                    <span className="text-black/30 text-lg sm:text-2xl font-heading">▶</span>
                </div>

                {/* Health Type Display */}
                {currentChar.health_type && (
                    <div className="flex items-center justify-center gap-2 mb-3 flex-wrap px-4">
                        <div className="flex items-center gap-1 font-pixel text-sm sm:text-base text-black/80">
                            <FaHeart className="text-red-600" />
                            <span>{currentChar.health_type}</span>
                        </div>
                    </div>
                )}

                {/* Starting Stats Icons */}
                {currentChar.starting_stats && (
                    <div className="flex items-center justify-center gap-4 sm:gap-6 mb-3">
                        {currentChar.starting_stats.bombs > 0 && (
                            <div className="flex items-center gap-1">
                                <FaBomb className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                                <span className="font-pixel text-sm sm:text-base">{currentChar.starting_stats.bombs}</span>
                            </div>
                        )}
                        {currentChar.starting_stats.keys > 0 && (
                            <div className="flex items-center gap-1">
                                <FaKey className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                                <span className="font-pixel text-sm sm:text-base">{currentChar.starting_stats.keys}</span>
                            </div>
                        )}
                        {currentChar.starting_stats.coins > 0 && (
                            <div className="flex items-center gap-1">
                                <span className="font-pixel text-yellow-600 text-sm sm:text-base">¢</span>
                                <span className="font-pixel text-sm sm:text-base">{currentChar.starting_stats.coins}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Starting Items - Game Style Boxes */}
                {currentChar.starting_items && currentChar.starting_items.length > 0 && (
                    <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap px-2 sm:px-4 mb-4">
                        {currentChar.starting_items.map((item, idx) => (
                            <div 
                                key={idx}
                                className="px-2 sm:px-3 py-1 bg-black/5 border border-black/20 font-pixel text-[10px] sm:text-xs text-black/80 uppercase"
                            >
                                {item}
                            </div>
                        ))}
                    </div>
                )}

                {/* View Details Button */}
                <button
                    onClick={() => onSelect && onSelect(currentChar)}
                    className={cn(
                        "px-5 sm:px-6 md:px-8 py-2 sm:py-3 bg-black text-white font-heading text-xs sm:text-sm md:text-base uppercase tracking-wider",
                        "border-2 border-white/80 shadow-[2px_2px_0_rgba(0,0,0,0.3)] sm:shadow-[3px_3px_0_rgba(0,0,0,0.3)]",
                        "transform hover:scale-105 hover:bg-accent-blood transition-all duration-200"
                    )}
                >
                    View Details
                </button>
            </motion.div>

            {/* Keyboard Hint - Desktop only */}
            <div className="hidden md:flex items-center justify-center gap-4 mt-6 sm:mt-8 text-black/40 text-xs sm:text-sm font-pixel">
                <span>← →</span>
                <span>{t('characters.navigate')}</span>
                <span className="mx-2">|</span>
                <span>{t('characters.selectKey')}</span>
                <span>{t('characters.selectAction')}</span>
            </div>

            {/* Difficulty Indicator */}
            {currentChar.difficulty && (
                <div className="absolute top-4 right-2 sm:right-4 hidden sm:block">
                    <div className="flex items-center gap-1">
                        {[...Array(3)].map((_, i) => (
                            <div 
                                key={i}
                                className={cn(
                                    "w-2 h-2 sm:w-3 sm:h-3 rounded-full border border-black/30",
                                    i < currentChar.difficulty ? "bg-accent-blood" : "bg-transparent"
                                )}
                            />
                        ))}
                    </div>
                    <span className="text-[10px] font-pixel text-black/50 mt-1 block text-right">{t('characters.difficulty')}</span>
                </div>
            )}
        </div>
    );
};

export default GameCharacterCarousel;
