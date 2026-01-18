// HeroSection.jsx - Hero with "Paper Map" aesthetic
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

export function HeroSection() {
    const navigate = useNavigate();

    return (
        <section className="relative w-full py-16 md:py-32 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-16 lg:gap-24 items-center">
            
            {/* Left Content */}
            <div className="flex flex-col items-start gap-8 z-10 px-4 md:px-0 relative">
                {/* Ink Stain Decoration */}
                <div className="absolute top-10 -left-12 w-64 h-64 bg-black opacity-5 rounded-full blur-3xl pointer-events-none -z-10 mix-blend-multiply"></div>
                <div className="absolute top-0 left-10 w-48 h-48 bg-accent-blood opacity-10 rounded-full blur-2xl pointer-events-none -z-10 mix-blend-multiply"></div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative"
                >
                     <div className="inline-block px-4 py-2 bg-[#2d2d2d] text-[#fdfbf7] font-heading text-lg -rotate-2 mb-6 border-2 border-dashed border-[#fdfbf7]/30 shadow-md">
                        Community Wiki & Database
                     </div>
                     
                     <div className="relative">
                        {/* Ink Splash SVG */}
                        <svg className="absolute -top-12 -left-12 w-[140%] h-[160%] text-black opacity-[0.08] -z-10 rotate-12" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                            <path fill="currentColor" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-4.9C93.5,9.3,82.2,22.9,71,34.3C59.9,45.7,48.8,55,36.5,62.8C24.2,70.6,10.7,77,-1.9,80.3C-14.5,83.6,-26.2,83.9,-37.7,78.2C-49.2,72.5,-60.5,60.8,-69.7,48.2C-78.9,35.6,-86,22.1,-86.6,8.2C-87.2,-5.7,-81.3,-20,-72.6,-32.1C-63.9,-44.2,-52.4,-54.1,-40.1,-62.4C-27.8,-70.7,-14.7,-77.4,0.3,-77.9C15.3,-78.4,30.5,-83.6,44.7,-76.4Z" transform="translate(100 100)" />
                        </svg>

                        <h2 className="text-7xl md:text-9xl font-heading text-text-heading leading-[0.8] tracking-tighter drop-shadow-xl mb-6 relative">
                            Explore <br/>
                            The <span className="text-accent-blood underline decoration-4 decoration-black underline-offset-8">Basement</span>
                        </h2>
                     </div>

                     <p className="font-handwriting text-2xl md:text-4xl text-text-ink/80 max-w-xl leading-relaxed mb-10">
                        Every Item, Trinket, Room, and Monster found in the depths below.
                        <br/>
                        <span className="text-sm font-sans opacity-60 uppercase tracking-widest mt-3 block font-bold border-l-4 border-accent-blood pl-3">Updated for Repentance</span>
                     </p>

                     <div className="flex flex-wrap gap-6">
                        <Button 
                            className="h-16 px-10 text-2xl font-heading border-[3px] border-black bg-accent-blood text-white hover:bg-black hover:text-accent-blood transition-all hover:-translate-y-1 hover:rotate-1 shadow-[6px_6px_0px_#000]"
                            onClick={() => navigate('/items')}
                        >
                            Browse Items
                        </Button>
                        <Button 
                            variant="outline"
                            className="h-16 px-10 text-2xl font-heading border-[3px] border-black bg-[#e6e2d6] text-black hover:bg-white hover:scale-105 transition-transform shadow-[6px_6px_0px_#000]"
                            onClick={() => navigate('/characters')}
                        >
                            Characters
                        </Button>
                     </div>
                </motion.div>
            </div>

            {/* Right Visual - "The Polaroid" */}
            <motion.div 
                className="relative flex justify-center items-center lg:justify-end pr-8"
                initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
                animate={{ opacity: 1, scale: 1, rotate: 6 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                {/* Polaroid Frame */}
                <div className="relative bg-white p-4 pb-28 shadow-[0_20px_50px_rgba(0,0,0,0.4)] rotate-3 hover:rotate-0 transition-transform duration-500 max-w-md w-full border-2 border-gray-300">
                    <div className="bg-[#0a0a0a] w-full aspect-square overflow-hidden border-2 border-[#1a1a1a] relative group cursor-pointer" onClick={() => navigate('/items')}>
                        {/* Static / Noise Overlay */}
                        <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none z-10"></div>
                        
                        {/* Hand Drawn 'X' Center Mark */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 bg-black/40 backdrop-blur-sm">
                             <span className="text-8xl text-accent-blood font-handwriting font-bold drop-shadow-md animate-pulse">?</span>
                        </div>

                        {/* Placeholder Content */}
                        <div className="w-full h-full bg-[#111] flex flex-col items-center justify-center relative overflow-hidden">
                            {/* Abstract Shapes */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-blood opacity-20 rounded-full blur-3xl"></div>
                            <span className="text-white/30 font-heading text-4xl text-center px-4 leading-tight relative z-0">
                                THE<br/>UNKNOWN<br/>DEPTHS
                            </span>
                        </div>
                    </div>
                    
                    {/* Scribble Label */}
                    <div className="absolute bottom-6 left-0 w-full text-center">
                        <span className="font-handwriting text-5xl text-black -rotate-2 inline-block font-bold opacity-90">
                            Item Pool #1
                        </span>
                    </div>

                    {/* Tape piece */}
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-40 h-12 bg-[#e0d8c0] shadow-md transform -rotate-1 opacity-90 border-l-2 border-r-2 border-dotted border-black/20"></div>
                    
                    {/* Coffee Stain */}
                    <div className="absolute bottom-4 right-4 w-24 h-24 border-[6px] border-[#6b4c35] opacity-20 rounded-full mix-blend-multiply filter blur-[1px]"></div>
                </div>

                {/* Decorative sticker */}
                <div className="absolute -bottom-12 -left-4 md:-left-12 w-28 h-28 bg-accent-gold rounded-full flex items-center justify-center shadow-xl border-[3px] border-dashed border-black rotate-12 hover:animate-spin transition-all cursor-crosshair">
                     <span className="font-heading text-black text-center text-sm leading-tight rotate-[-12deg]">100%<br/>REAL<br/>GUIDE!</span>
                </div>

            </motion.div>
        </section>
    );
}

// Simple Icon Placeholders (if needed internally, but using react-icons in Header mostly)
