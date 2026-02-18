import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { CompletionMarks } from './CompletionMarks';

export const CharacterCard = ({ character, isActive, isTainted, onSelect }) => {
    return (
        <div className={cn(
            "relative flex flex-col items-center justify-center",
            "transition-all duration-500",
            isActive ? "z-50 opacity-100" : "scale-75 z-0 opacity-40 blur-[1px] grayscale-[50%]"
        )}>
            
            {/* The "Who Am I?" Paper Sheet - Using vh for responsive sizing */}
            <motion.div 
                layoutId={`char-card-${character.id}`}
                className={cn(
                    "relative w-[45vw] max-w-[320px] aspect-[2/3]",
                    "bg-[#f4e4bc] shadow-lg",
                    "flex flex-col items-center justify-between py-[3%] px-[2%]",
                    isTainted ? "bg-stone-400 border-t-4 border-red-900/50" : "bg-[#f4e4bc]",
                    isActive && "drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                )}
                style={{
                    maxHeight: '55vh',
                    clipPath: `polygon(
                        2% 0%, 98% 0%, 100% 2%, 99% 98%, 
                        90% 100%, 80% 98%, 70% 100%, 60% 99%, 50% 100%, 
                        40% 99%, 30% 100%, 20% 98%, 10% 100%, 0% 98%
                    )`
                }}
            >
                {/* Background Grunge/Noise */}
                <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none"></div>
                {isTainted && <div className="absolute inset-0 bg-gradient-to-b from-red-900/10 to-black/20 pointer-events-none mix-blend-multiply"></div>}

                {/* Completion Note (Post-it) - Pinned to Top Right */}
                <div className="absolute top-[5%] right-[2%] z-30 transform rotate-3 scale-[0.5] sm:scale-[0.6] md:scale-[0.75] origin-top-right">
                    {/* Pin visual */}
                    <div className="absolute -top-2 left-1/2 w-3 h-3 bg-red-800 rounded-full border border-black z-40 shadow-sm"></div>
                    <CompletionMarks isTainted={isTainted} />
                </div>

                {/* Character Sprite Container */}
                <div className="relative w-[45%] aspect-square flex items-center justify-center z-20 group mt-[5%]"> 
                    
                    {/* Shadow under sprite */}
                    <div className="absolute bottom-0 w-[60%] h-[15%] bg-black/20 blur-xl rounded-[100%]"></div>
                    
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

                {/* Name Header */}
                <h2 className={cn(
                    "font-heading text-[clamp(0.8rem,3vw,1.8rem)] tracking-widest uppercase z-20 text-center",
                    isTainted ? "text-red-900 drop-shadow-[2px_2px_0_#000]" : "text-black"
                )}>
                    {character.name}
                </h2>

                {/* Flavor Text */}
                <div className="font-handwriting text-[clamp(0.6rem,2vw,1rem)] text-center px-[5%] opacity-70 rotate-[-1deg] text-black/60">
                    &quot;{isTainted ? "The broken soul" : "The lost child"}&quot;
                </div>


                {/* View Details Button (Only Visible when Active) */}
                <AnimatePresence>
                    {isActive && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="z-40 mt-auto mb-[5%]"
                        >
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSelect && onSelect();
                                }}
                                className={cn(
                                    "px-[clamp(0.5rem,2vw,1.5rem)] py-[clamp(0.25rem,1vw,0.5rem)] bg-black text-white font-heading text-[clamp(0.5rem,1.5vw,0.875rem)] uppercase tracking-wider",
                                    "border border-white/90 shadow-[2px_2px_0_rgba(0,0,0,0.5)]",
                                    "transform hover:scale-105 hover:bg-red-900 transition-all duration-200"
                                )}
                                style={{
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
