import { DustParticles } from './DustParticles';
import { cn } from '../../lib/utils';

export const LoginLayout = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0a] flex flex-col items-center justify-center overflow-hidden font-sans text-text-heading">
      
      {/* 1. Atmospheric Background Layer */}
      <DustParticles count={50} />
      
      {/* Basement Vignette Effect */}
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.8) 100%)'
        }}
      />
      
      {/* 2. Main Content Wrapper (Z-index 10 to sit above dust) */}
      <div className="relative z-10 w-full max-w-md px-4">
        
        {/* The "Sheet of Paper" Container */}
        <div 
            className={cn(
                "relative bg-[#f5edd8] p-6 sm:p-8 md:p-10",
                "shadow-[0_0_80px_-10px_rgba(139,69,19,0.5),0_0_120px_-20px_rgba(0,0,0,0.9)]",
                "transition-transform duration-500",
            )}
            style={{
                borderRadius: '3px',
                // Paper texture + aged look
                backgroundImage: `
                    url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.06'/%3E%3C/svg%3E"), 
                    linear-gradient(135deg, #f5edd8 0%, #e8dcc4 50%, #f0e4ce 100%)
                `,
                // Torn paper effect via clip-path
                clipPath: `polygon(
                    0% 2%, 3% 0%, 8% 1%, 15% 0%, 22% 1.5%, 30% 0%, 
                    38% 0.5%, 45% 0%, 55% 1%, 62% 0%, 70% 0.5%, 
                    78% 0%, 85% 1%, 92% 0%, 97% 1.5%, 100% 0%,
                    100% 98%, 97% 100%, 90% 99%, 82% 100%, 75% 98.5%,
                    68% 100%, 60% 99%, 52% 100%, 45% 98.5%, 38% 100%,
                    30% 99%, 22% 100%, 15% 98%, 8% 100%, 2% 99%, 0% 100%
                )`,
            }}
        >
            {/* Tape at top */}
            <div 
              className="absolute -top-2 left-1/2 -translate-x-1/2 w-20 h-6 opacity-70 transform -rotate-1"
              style={{
                background: 'linear-gradient(135deg, rgba(200,180,140,0.9) 0%, rgba(180,160,120,0.85) 100%)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            />
            
            {/* Coffee stain decoration */}
            <div 
              className="absolute top-4 right-4 w-12 h-12 rounded-full opacity-[0.08] pointer-events-none"
              style={{
                background: 'radial-gradient(circle, #8B4513 0%, transparent 70%)',
              }}
            />

            {/* Inner Content */}
            {children}
            
            {/* Footer decoration inside the card */}
            <div className="mt-6 pt-4 border-t-2 border-[#5c4a32]/20 border-dashed text-center">
                 <p className="font-handwriting text-[#5c4a32]/50 text-sm italic">
                    "Only the penitent man shall pass..."
                 </p>
            </div>
        </div>

      </div>

      {/* 3. Global Footer (outside paper) */}
      <footer className="absolute bottom-4 left-0 w-full text-center text-white/20 font-pixel text-xs z-10 tracking-widest">
         TBOI Codex © {new Date().getFullYear()}
      </footer>

    </div>
  );
};
