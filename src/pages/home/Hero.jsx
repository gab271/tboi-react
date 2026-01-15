import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { FaArrowRight, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export function Hero() {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <div className="relative h-screen min-h-[800px] w-full overflow-hidden flex items-center justify-center">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 bg-bg-0 z-0">
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--bg-1)_0%,_transparent_70%)] opacity-40" />
         <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blood/5 rounded-full blur-[100px]" />
      </div>

      {/* Floating Elements (Parallax) */}
      <motion.div style={{ y: y2 }} className="absolute top-20 right-[10%] w-32 h-32 md:w-48 md:h-48 rounded-full border border-white/5 opacity-20 pointer-events-none z-10" />
      <motion.div style={{ y: y1 }} className="absolute bottom-40 left-[10%] w-24 h-24 md:w-32 md:h-32 rounded-full bg-surface/10 blur-xl z-0" />

      <div className="relative z-10 container mx-auto px-6 text-center flex flex-col items-center">
        
        {/* Animated Badge */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "out" }}
            className="mb-8"
        >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-muted-foreground backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Updated to Repentance v1.7.9b
            </span>
        </motion.div>

        {/* Massive Typography */}
        <motion.h1 
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.8, ease: "circOut" }}
           className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/40 mb-6 tracking-tighter drop-shadow-2xl"
           style={{ fontFamily: "'Inter', sans-serif" }} // Assuming standard sans, but font-serif is used in current home
        >
          BASEMENT<br/>BIBLE
        </motion.h1>

        <motion.p 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.3, duration: 0.8 }}
           className="max-w-xl text-lg md:text-xl text-muted-foreground leading-relaxed mb-10"
        >
          The ultimate knowledge base for <strong>The Binding of Isaac</strong>. 
          Analyze item synergies, defeat bosses, and track your progress through the depths.
        </motion.p>

        {/* Interactive Buttons */}
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.5, duration: 0.5 }}
           className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <Button 
            className="h-14 px-8 text-lg rounded-full bg-white text-black hover:bg-gray-200 transition-all font-semibold"
            onClick={() => navigate('/items')}
          >
            <FaSearch className="mr-2 text-sm" /> Search Items
          </Button>
          <Button 
            variant="outline" 
            className="h-14 px-8 text-lg rounded-full border-white/20 hover:bg-white/5 transition-all text-white backdrop-blur-md"
            onClick={() => navigate('/account')}
          >
             My Progress <FaArrowRight className="ml-2 text-sm group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>
      
      {/* Scroll Hint */}
      <motion.div 
        style={{ opacity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/20 text-sm animate-bounce flex flex-col items-center gap-2"
      >
        <div className="w-[1px] h-12 bg-white/20" />
        SCROLL
      </motion.div>
    </div>
  );
}
