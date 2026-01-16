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

      {/* 4. Footer CTA / Ambient Ender */}
      <section className="relative py-40 flex items-center justify-center overflow-hidden">
         {/* Background Elements */}
         <div className="absolute inset-0 bg-bg-0 z-0">
             <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-black via-bg-0 to-transparent" />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blood/10 rounded-full blur-[120px]" />
         </div>

         <div className="relative z-10 container px-6 text-center">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <div className="inline-block mb-4">
                     <span className="px-4 py-1.5 rounded-full border border-blood/30 bg-blood/10 text-blood text-xs font-mono uppercase tracking-[0.2em] backdrop-blur-sm">
                        Authentication Required
                     </span>
                </div>

                <h2 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40 drop-shadow-2xl font-serif">
                    ESCAPE THE <span className="text-blood inline-block transform hover:scale-105 transition-transform duration-500 cursor-default">BASEMENT</span>
                </h2>
                
                <p className="text-xl md:text-2xl text-muted-foreground/80 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
                    Join thousands of players in the ultimate Codex.
                    <br />
                    <span className="text-gold/90 font-medium">Save builds</span>, <span className="text-gold/90 font-medium">track items</span>, and <span className="text-gold/90 font-medium">master your runs</span>.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                     <Button 
                        onClick={() => navigate('/auth/login')}
                        className="h-14 px-10 text-lg bg-bg-0 border border-white/20 text-white hover:bg-white hover:text-black hover:scale-105 transition-all duration-300 font-bold tracking-widest rounded-full shadow-[0_0_40px_rgba(0,0,0,0.5)] group relative overflow-hidden"
                     >
                        <span className="relative z-10">START YOUR RUN</span>
                        <div className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out z-0" />
                     </Button>
                </div>
                
                <p className="mt-12 text-xs text-muted-foreground/40 uppercase tracking-[0.3em] font-mono">
                    Official TBOI Companion
                </p>
            </motion.div>
         </div>
      </section>

    </div>
  );
}
