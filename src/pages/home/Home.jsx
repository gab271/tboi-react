import React from 'react';
import { Hero } from './Hero';
import { LiveTicker } from './LiveTicker';
import { FeaturesGrid } from './FeaturesGrid';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export function Home() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col min-h-screen bg-bg-0 text-fg overflow-x-hidden">
      
      {/* 1. Immersive Hero Section */}
      <Hero />
      
      {/* 2. Live Data Feed (Infinite Marquee) */}
      <LiveTicker />

      {/* 3. Main Navigation Grid (Bento Style) */}
      <FeaturesGrid />

      {/* 4. Footer CTA / Ambient Ender: The Missing Poster */}
      <section className="relative py-32 flex items-center justify-center overflow-hidden">
         {/* Background Floor */}
         <div className="absolute inset-0 bg-bg-floor pointer-events-none"></div>

         <motion.div 
            initial={{ rotate: 1, y: 50, opacity: 0 }}
            whileInView={{ rotate: -2, y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, type: "spring" }}
            className="relative z-10 w-full max-w-lg bg-[#F4EBE4] p-8 pb-12 shadow-[0_20px_40px_rgba(0,0,0,0.6)] flex flex-col items-center text-center paper-texture"
         >
            {/* Pin at top */}
            <div className="w-4 h-4 rounded-full bg-red-800 shadow-sm mb-6 border border-black/20 mx-auto"></div>

            <h2 className="text-6xl font-heading text-black mb-2 tracking-tighter uppercase relative">
                Missing
                <div className="absolute -bottom-2 left-0 w-full h-1 bg-black skew-x-12"></div>
            </h2>
            
            <div className="w-full aspect-[4/3] bg-black/10 my-6 flex items-center justify-center border-4 border-black/5 overflow-hidden">
                <div className="w-32 h-32 rounded-full bg-black flex items-center justify-center">
                    <span className="text-4xl">?</span>
                </div>
            </div>

            <p className="text-2xl font-heading font-black text-black mb-2 uppercase">
                Have you seen this way out?
            </p>
            
            <p className="font-handwriting text-xl text-black/70 mb-8 leading-tight">
                Last seen in the Basement depths. Approach with extreme caution.
            </p>

            <Button 
                onClick={() => navigate('/auth/login')}
                className="w-full h-16 font-pixel text-2xl bg-black text-white hover:bg-accent-blood hover:scale-105 transition-all skew-x-0 hover:-skew-x-2 shadow-lg flex items-center justify-center gap-3"
            >
                ESCAPE NOW
            </Button>
            
            <div className="mt-8 flex gap-1 justify-center opacity-60">
                 {[1,2,3,4,5].map(i => (
                     <div key={i} className="w-8 h-12 border-x border-dashed border-black/20" />
                 ))}
            </div>
         </motion.div>
      </section>

    </div>
  );
}
