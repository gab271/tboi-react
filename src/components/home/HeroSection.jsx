// HeroSection.jsx - Hero with "Paper Map" aesthetic
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

export function HeroSection() {
    const navigate = useNavigate();

    return (
        <section className="relative w-full py-12 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <div className="flex flex-col items-start gap-8 z-10 px-4 md:px-0">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                     <div className="inline-block px-4 py-2 bg-[#2d2d2d] text-[#fdfbf7] font-heading text-lg -rotate-2 mb-4 border-2 border-dashed border-[#fdfbf7]/30 shadow-md">
                        Community Wiki & Database
                     </div>
                     <h2 className="text-6xl md:text-8xl font-heading text-text-heading leading-[0.85] tracking-tighter drop-shadow-xl mb-6">
                        Explore <br/>
                        The <span className="text-accent-blood underline decoration-4 decoration-black underline-offset-8">Basement</span>
                     </h2>
                     <p className="font-handwriting text-2xl md:text-3xl text-text-ink/80 max-w-lg leading-relaxed mb-8">
                        Every Item, Trinket, Room, and Monster found in the depths below.
                        <br/>
                        <span className="text-sm font-sans opacity-60 uppercase tracking-widest mt-2 block font-bold">Updated for Repentance</span>
                     </p>

                     <div className="flex flex-wrap gap-4">
                        <Button 
                            className="h-16 px-8 text-2xl font-heading border-black border-2 bg-accent-blood text-white hover:bg-black hover:text-accent-blood transition-transform hover:-rotate-1 shadow-[4px_4px_0px_#000]"
                            onClick={() => navigate('/items')}
                        >
                            Browse Items
                        </Button>
                        <Button 
                            variant="outline"
                            className="h-16 px-8 text-2xl font-heading border-black border-2 bg-[#e6e2d6] text-black hover:bg-white hover:scale-105 transition-transform shadow-[4px_4px_0px_#000]"
                            onClick={() => navigate('/characters')}
                        >
                            Characters
                        </Button>
                     </div>
                </motion.div>
            </div>

            {/* Right Visual - "The Polaroid" or Map */}
            <motion.div 
                className="relative flex justify-center items-center"
                initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
                animate={{ opacity: 1, scale: 1, rotate: 3 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                {/* Polaroid Frame */}
                <div className="relative bg-white p-4 pb-16 shadow-[0_20px_50px_rgba(0,0,0,0.3)] rotate-3 max-w-md w-full border border-gray-200">
                    <div className="bg-black w-full aspect-square overflow-hidden border-2 border-[#1a1a1a] relative group cursor-pointer" onClick={() => navigate('/items')}>
                        {/* Static / Noise Overlay */}
                        <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none z-10"></div>
                        
                        {/* Hand Drawn 'X' Center Mark */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                             <span className="text-9xl text-accent-blood font-handwriting font-bold drop-shadow-md">?</span>
                        </div>

                        {/* Placeholder Content (Can be an iconic image URL later) */}
                        <div className="w-full h-full bg-[#111] flex items-center justify-center">
                            <span className="text-white/20 font-heading text-4xl text-center px-4">THE UNKNOWN DEPTHS</span>
                        </div>
                    </div>
                    
                    {/* Scribble Label */}
                    <div className="absolute bottom-4 left-0 w-full text-center">
                        <span className="font-handwriting text-4xl text-black -rotate-1 inline-block font-bold">
                            Item Pool
                        </span>
                    </div>

                    {/* Tape piece top corner */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-32 h-10 bg-[#e0d8c0] shadow-sm transform -rotate-2 opacity-90 border-l border-r border-dotted border-black/10"></div>
                </div>

                {/* Decorative sticker */}
                <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-accent-gold rounded-full flex items-center justify-center shadow-lg border-2 border-dashed border-black rotate-12 animate-pulse">
                     <span className="font-heading text-black text-center text-sm leading-tight">100%<br/>REAL!</span>
                </div>

            </motion.div>
        </section>
    );
}

// Simple Icon Placeholders (if needed internally, but using react-icons in Header mostly)
