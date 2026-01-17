import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { FaArrowRight, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export function Hero() {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <div className="relative min-h-[800px] w-full flex items-center justify-center py-20 overflow-visible">
      
      {/* Container: The "Map" on the Floor */}
      <motion.div 
         initial={{ scale: 0.95, opacity: 0 }}
         animate={{ scale: 1, opacity: 1 }}
         transition={{ duration: 1 }}
         className="relative w-full max-w-6xl mx-auto bg-[#E3DAC9] p-8 md:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rotate-1 paper-texture border-4 border-[#C0B283]/20"
         style={{
             backgroundImage: `url("https://www.transparenttextures.com/patterns/aged-paper.png"), radial-gradient(circle, #E3DAC9 0%, #d4c5a3 100%)`
         }}
      >
          {/* Torn Edge Effect (Top/Bottom) - Simulated with CSS clip-path or simple borders */}
          <div className="absolute -top-2 left-0 w-full h-4 bg-[#E3DAC9] clip-path-jagged-top" />
          <div className="absolute -bottom-2 left-0 w-full h-4 bg-[#E3DAC9] clip-path-jagged-bottom" />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center text-center">
                
                {/* Hand-drawn Map Elements Decoration */}
                <div className="absolute top-10 left-10 opacity-20 hidden md:block rotate-12">
                     <svg width="100" height="100" viewBox="0 0 100 100" className="text-text-ink stroke-current fill-none stroke-2">
                         <path d="M10,10 Q50,5 90,10 T90,90 Q50,95 10,90 T10,10" />
                         <path d="M30,30 L70,70 M30,70 L70,30" className="text-accent-blood" />
                     </svg>
                </div>

                <div className="absolute bottom-10 right-10 opacity-20 hidden md:block -rotate-12">
                     <svg width="80" height="80" viewBox="0 0 100 100" className="text-text-ink stroke-current fill-none stroke-2">
                         <circle cx="50" cy="50" r="40" />
                         <path d="M50,10 L50,90 M10,50 L90,50" />
                     </svg>
                </div>

                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-6"
                >
                    <span className="inline-block px-4 py-1.5 rounded bg-text-ink/5 border border-text-ink/20 text-text-dim font-handwriting text-lg rotate-2">
                        Updated for Repentance
                    </span>
                </motion.div>

                <h1 className="text-6xl md:text-8xl font-heading text-text-heading mb-6 tracking-tight drop-shadow-sm uppercase">
                    Basement<br/>
                    <span className="text-accent-blood relative inline-block">
                        Codex
                        <svg className="absolute -bottom-2 left-0 w-full h-4 text-text-ink opacity-80" viewBox="0 0 100 10" preserveAspectRatio="none"> 
                            <path d="M0,5 Q50,15 100,5" stroke="currentColor" strokeWidth="3" fill="none" />
                        </svg>
                    </span>
                </h1>

                <p className="max-w-2xl text-xl md:text-2xl font-handwriting text-text-ink mb-12 leading-relaxed">
                   "A crude map drawn in crayon... it details every item, monster, and secret found in the depths below."
                </p>

                <div className="flex flex-col sm:flex-row gap-6">
                    <Button 
                        variant="outline" 
                        size="lg" 
                        onClick={() => navigate('/items')}
                        className="font-pixel text-2xl border-4 hover:border-accent-blood hover:text-accent-blood"
                    >
                        Read Codex
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="lg" 
                        onClick={() => navigate('/bosses')}
                        className="font-pixel text-2xl text-text-dim hover:text-text-ink underline decoration-wavy"
                    >
                         View Bosses
                    </Button>
                </div>
          </div>
      </motion.div>
    </div>
  );
}
