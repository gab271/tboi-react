import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { CompletionMarks } from './CompletionMarks';

export const CharacterCard = ({ character, isActive, isTainted }) => {
    return (
        <div className={cn(
            "relative flex flex-col items-center justify-center",
            "transition-all duration-500",
            isActive ? "scale-100 z-20 opacity-100" : "scale-75 z-0 opacity-40 blur-[1px] grayscale-[50%]"
        )}>
            
            {/* The "Who Am I?" Paper Sheet */}
            <motion.div 
                layoutId={`char-card-${character.id}`}
                className={cn(
                    "relative w-[280px] h-[400px] md:w-[320px] md:h-[450px]",
                    "bg-[#fdfbf7] shadow-[0_10px_40px_rgba(0,0,0,0.3)]",
                    "flex flex-col items-center pt-12 pb-8",
                    isTainted ? "bg-stone-300 border-t-4 border-red-900/50" : "bg-[#fdfbf7]"
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

                {/* Name Header (Handwritten) */}
                <h2 className={cn(
                    "font-heading text-4xl mb-6 tracking-widest uppercase z-10",
                    isTainted ? "text-red-900 drop-shadow-[2px_2px_0_#000]" : "text-black"
                )}>
                    {character.name}
                </h2>

                {/* Character Sprite Container */}
                <div className="relative w-48 h-48 md:w-56 md:h-56 flex items-center justify-center mb-8 z-10 group">
                    {/* Shadow under sprite */}
                    <div className="absolute bottom-4 w-32 h-8 bg-black/20 blur-xl rounded-[100%]"></div>
                    
                    {character.image ? (
                        <motion.img 
                            src={character.image} 
                            alt={character.name}
                            className={cn(
                                "w-full h-full object-contain filter drop-shadow-lg",
                                isTainted && "brightness-90 contrast-125 sepia-[0.3] hue-rotate-[-20deg]" // Fake tainted effect if image is same
                            )}
                            animate={isActive ? { y: [0, -10, 0] } : {}}
                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        />
                    ) : (
                        <div className="text-6xl text-gray-300">?</div>
                    )}
                </div>

                {/* "Who Am I?" Text or Flavor */}
                <div className="font-handwriting text-xl text-center px-8 opacity-70 rotate-[-1deg] text-black">
                    "{isTainted ? "The broken soul..." : "The lost child..."}"
                </div>
                
                {/* Completion Note (Post-it) - Pinned to Top Right */}
                <div className="absolute top-4 -right-6 md:-right-8 z-30 transform rotate-6 hover:rotate-3 transition-transform origin-top-left">
                    {/* Pin visual */}
                    <div className="absolute -top-2 left-1/2 w-3 h-3 bg-red-800 rounded-full border border-black z-40 shadow-sm"></div>
                    <CompletionMarks isTainted={isTainted} />
                </div>

            </motion.div>
        </div>
    );
};
