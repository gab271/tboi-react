import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { CompletionMarks } from './CompletionMarks';

export const CharacterCard = ({ character, isActive, isTainted, onSelect }) => {
    return (
        <div className={cn(
            "relative flex flex-col items-center justify-center",
            "transition-all duration-500",
            isActive ? "scale-125 z-50 opacity-100" : "scale-75 z-0 opacity-40 blur-[1px] grayscale-[50%]"
        )}>
            
            {/* The "Who Am I?" Paper Sheet */}
            <motion.div 
                layoutId={`char-card-${character.id}`}
                className={cn(
                    "relative w-[260px] h-[360px] md:w-[320px] md:h-[480px]", // Increased height for laptop/desktop
                    "bg-[#f4e4bc] shadow-lg",
                    "flex flex-col items-center pt-10 md:pt-14 pb-4 md:pb-8",
                    isTainted ? "bg-stone-400 border-t-4 border-red-900/50" : "bg-[#f4e4bc]",
                    isActive && "drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                )}
                style={{
                    clipPath: `polygon(
                        2% 0%, 98% 0%, 100% 2%, 99% 98%, 
                        90% 100%, 80% 98%, 70% 100%, 60% 99%, 50% 100%, 
                        40% 99%, 30% 100%, 20% 98%, 10% 100%, 0% 98%
                    )` // Torn bottom edge
                }}
            >
                {/* Background Grunge/Noise */}
                <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none"></div>
                {isTainted && <div className="absolute inset-0 bg-gradient-to-b from-red-900/10 to-black/20 pointer-events-none mix-blend-multiply"></div>}

                {/* Completion Note (Post-it) - Pinned to Top Right */}
                <div className="absolute top-4 right-1 sm:top-6 sm:right-2 z-30 transform rotate-3 transition-transform origin-top-left scale-[0.7] sm:scale-90">
                    {/* Pin visual */}
                    <div className="absolute -top-2 left-1/2 w-3 h-3 bg-red-800 rounded-full border border-black z-40 shadow-sm"></div>
                    <CompletionMarks isTainted={isTainted} />
                </div>

                {/* Character Sprite Container */}
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 flex items-center justify-center mb-2 sm:mb-4 z-20 group -ml-2 sm:-ml-4"> 
                    
                    {/* Shadow under sprite */}
                    <div className="absolute bottom-2 w-20 h-4 sm:w-24 sm:h-6 bg-black/20 blur-xl rounded-[100%]"></div>
                    
                    {character.image ? (
                        <motion.img 
                            src={character.image} 
                            alt={character.name}
                            className={cn(
                                "w-full h-full object-contain filter drop-shadow-lg",
                                isTainted && "brightness-90 contrast-125 sepia-[0.3]" 
                            )}
                            animate={isActive ? { y: [0, -5, 0] } : {}}
                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        />
                    ) : (
                        <div className="text-4xl sm:text-6xl text-gray-300">?</div>
                    )}
                </div>

                {/* Name Header - MOVED BELOW IMAGE */}
                <h2 className={cn(
                    "font-heading text-2xl sm:text-3xl mb-1 sm:mb-2 tracking-widest uppercase z-20 text-center -ml-2 sm:-ml-4",
                    isTainted ? "text-red-900 drop-shadow-[2px_2px_0_#000]" : "text-black"
                )}>
                    {character.name}
                </h2>

                {/* "Who Am I?" Text or Flavor */}
                <div className="font-handwriting text-base sm:text-lg text-center px-4 sm:px-8 opacity-70 rotate-[-1deg] text-black/60 -ml-2 sm:-ml-4">
                    "{isTainted ? "The broken soul" : "The lost child"}"
                </div>


                {/* View Details Button (Only Visible when Active) */}
                <AnimatePresence>
                    {isActive && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute bottom-6 z-40"
                        >
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSelect && onSelect();
                                }}
                                className={cn(
                                    "px-6 py-2 bg-black text-white font-heading text-sm uppercase tracking-wider",
                                    "border-2 border-white/90 shadow-[2px_2px_0_rgba(0,0,0,0.5)]",
                                    "transform hover:scale-105 hover:bg-red-900 transition-all duration-200",
                                    "clip-path-jagged" // Optional if you have a class, otherwise relying on border
                                )}
                                style={{
                                    // Custom irregular border effect simulation if clip-path class doesn't exist
                                    borderRadius: "2px 255px 3px 25px / 255px 5px 225px 5px" 
                                }}
                            >
                                View Details
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

            </motion.div>
        </div>
    );
};
