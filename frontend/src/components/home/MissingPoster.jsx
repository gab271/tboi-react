// MissingPoster.jsx - A torn paper style poster for the 'Missing' section
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

export const MissingPoster = () => {
    const navigate = useNavigate();

    return (
        <section className="relative py-32 flex items-center justify-center overflow-hidden">
            
            {/* 
              Parent Container: Handles rotation, positioning, and SHADOW.
              The shadow is applied here so it isn't clipped by the child's clip-path.
            */}
            <motion.div 
                initial={{ rotate: 1, y: 50, opacity: 0 }}
                whileInView={{ rotate: 1.5, y: 0, opacity: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, type: "spring", stiffness: 50 }}
                className="relative z-10 w-full max-w-lg filter drop-shadow-xl"
            >
                {/* 
                   The "Tape" Effect
                   Positioned absolute on top of the paper.
                */}
                <div 
                    className="absolute -top-4 left-1/2 -translate-x-1/2 w-40 h-10 z-20 pointer-events-none"
                    style={{
                        background: 'rgba(255, 255, 255, 0.3)',
                        backdropFilter: 'blur(2px)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        transform: 'rotate(-1.5deg) skewY(1deg)',
                        clipPath: 'polygon(0% 10%, 5% 0%, 100% 5%, 95% 90%, 0% 100%)' // Irregular tape shape
                    }}
                />

                {/* 
                   The Paper Itself: Handles background, noise, and the SAWTOOTH CLIP-PATH.
                */}
                <div 
                    className="relative bg-[#fdfbf7] p-10 pb-16 flex flex-col items-center text-center overflow-hidden"
                    style={{
                         clipPath: 'polygon(0% 0%, 5% 2%, 10% 0%, 15% 2%, 20% 0%, 25% 2%, 30% 0%, 35% 2%, 40% 0%, 45% 2%, 50% 0%, 55% 2%, 60% 0%, 65% 2%, 70% 0%, 75% 2%, 80% 0%, 85% 2%, 90% 0%, 95% 2%, 100% 0%, 100% 100%, 95% 98%, 90% 100%, 85% 98%, 80% 100%, 75% 98%, 70% 100%, 65% 98%, 60% 100%, 55% 98%, 50% 100%, 45% 98%, 40% 100%, 35% 98%, 30% 100%, 25% 98%, 20% 100%, 15% 98%, 10% 100%, 5% 98%, 0% 100%)'
                    }}
                >
                    {/* Noise Texture Overlay */}
                    <div className="absolute inset-0 bg-noise opacity-[0.05] pointer-events-none mix-blend-multiply" />

                    <h2 className="text-6xl font-heading text-black mb-2 tracking-tighter uppercase relative mt-4">
                        Missing
                    </h2>
                    
                    {/* Image Placeholder Box */}
                    <div className="w-full aspect-[4/3] bg-black/5 my-6 flex items-center justify-center border-hand-drawn border-black/10 overflow-hidden relative">
                         {/* Blue Baby (???) image */}
                        <div className="w-40 h-40 flex items-center justify-center relative z-10">
                            <img 
                                src="/sprites/0_Characters/0_Vanilla/Blue Baby.png" 
                                alt="???" 
                                className="w-full h-full object-contain pixelated drop-shadow-lg"
                            />
                        </div>
                        {/* Grunge scratch overlay on image area */}
                        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/scratches.png')] mix-blend-multiply"></div>
                    </div>

                    <p className="text-2xl font-heading font-black text-black mb-1 uppercase">
                        ???
                    </p>
                    
                    <p className="font-handwriting text-xl text-black/70 mb-8 leading-tight">
                        Last seen in the Basement depths. Approach with extreme caution.
                    </p>

                    <Button 
                        onClick={() => navigate('/auth/login')}
                        className={cn(
                            "w-full h-16 font-pixel text-2xl flex items-center justify-center gap-3 transition-all duration-300",
                            "border-hand-drawn border-black bg-transparent text-black shadow-none", // Default state
                            "hover:bg-black hover:text-[#8a1c1c] hover:border-black hover:-rotate-1 hover:scale-105" // Hover state: Inverted
                        )}
                    >
                        ESCAPE NOW
                    </Button>
                </div>

            </motion.div>
        </section>
    );
};
