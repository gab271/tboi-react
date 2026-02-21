import { motion } from 'framer-motion';

export const NightmareLoading = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white overflow-hidden"
    >
      {/* Background noise/scratches */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ 
             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")` 
           }}
      />
      
      <div className="relative z-10 flex flex-col items-center gap-8 p-8">
        {/* Animated Nightmare Text */}
        <motion.h2 
          animate={{ scale: [1, 1.05, 1], rotate: [-1, 1, -1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="text-4xl md:text-6xl font-handwriting tracking-widest text-[#5a5a5a]"
        >
          ARE YOU SURE YOU WANT ME TO DIE?
        </motion.h2>

        <div className="w-16 h-16 border-4 border-[#333] border-t-[#888] rounded-full animate-spin" />
        
        <p className="font-pixel text-xl text-[#444] animate-pulse">
          LOADING...
        </p>
      </div>
    </motion.div>
  );
};
