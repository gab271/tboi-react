// HeroRedesign.jsx - New Hero with clear value proposition
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { FaChartLine, FaTrophy } from 'react-icons/fa';

export function HeroRedesign() {
    const navigate = useNavigate();

    return (
        <section className="relative w-full min-h-[70vh] flex items-center py-12 md:py-20 overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-20 left-10 w-64 h-64 bg-accent-blood opacity-5 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-black opacity-10 rounded-full blur-3xl" />
                
                {/* Floating item sprites - subtle */}
                <motion.img
                    src="/sprites/1_Passive Items/Brimstone.png"
                    alt=""
                    className="absolute top-1/4 right-[15%] w-12 h-12 pixelated opacity-20 hidden lg:block"
                    animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.img
                    src="/sprites/1_Passive Items/Sacred Heart.png"
                    alt=""
                    className="absolute top-1/2 right-[8%] w-10 h-10 pixelated opacity-15 hidden lg:block"
                    animate={{ y: [0, -8, 0], rotate: [0, -5, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                />
                <motion.img
                    src="/sprites/1_Passive Items/Polyphemus.png"
                    alt=""
                    className="absolute bottom-1/3 right-[20%] w-8 h-8 pixelated opacity-10 hidden lg:block"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                />
            </div>

            <div className="relative z-10 w-full max-w-6xl mx-auto px-4 md:px-8">
                <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                    
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-6"
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-accent-blood/10 border border-accent-blood/30 text-accent-blood font-heading text-sm uppercase tracking-wider">
                            <span className="w-2 h-2 bg-accent-blood rounded-full animate-pulse" />
                            Companion App para Isaac
                        </span>
                    </motion.div>

                    {/* H1 - Main headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading text-text-heading leading-[0.95] tracking-tight mb-6"
                    >
                        Deja de morir
                        <br />
                        <span className="text-accent-blood">en el Basement</span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg md:text-xl lg:text-2xl font-handwriting text-text-ink/80 max-w-2xl mb-8 leading-relaxed"
                    >
                        El companion que analiza tu run en tiempo real, descubre sinergias ocultas
                        y trackea tu camino a <span className="text-accent-gold font-bold">Dead God</span>.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex flex-col sm:flex-row gap-4 mb-4 w-full sm:w-auto"
                    >
                        {/* Primary CTA */}
                        <Button
                            onClick={() => document.getElementById('item-analyzer')?.scrollIntoView({ behavior: 'smooth' })}
                            className="h-14 sm:h-16 px-8 sm:px-10 text-lg sm:text-xl font-heading bg-accent-blood text-white border-[3px] border-black hover:bg-black hover:text-accent-blood transition-all shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] hover:-translate-y-1 w-full sm:w-auto flex items-center justify-center gap-3"
                        >
                            <FaChartLine className="w-5 h-5" />
                            Analizar mi run
                        </Button>

                        {/* Secondary CTA */}
                        <Button
                            onClick={() => document.getElementById('progress-tracker')?.scrollIntoView({ behavior: 'smooth' })}
                            variant="outline"
                            className="h-14 sm:h-16 px-8 sm:px-10 text-lg sm:text-xl font-heading border-[3px] border-black bg-bg-paper text-black hover:border-accent-gold hover:text-accent-gold transition-all shadow-[4px_4px_0px_#000] w-full sm:w-auto flex items-center justify-center gap-3"
                        >
                            <FaTrophy className="w-5 h-5" />
                            Trackear progreso
                        </Button>
                    </motion.div>

                    {/* Microcopy */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="text-sm text-text-dim font-sans"
                    >
                        Sin registro · Resultados en 3 segundos
                    </motion.p>

                    {/* Secondary links */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="flex flex-wrap gap-4 mt-8 text-sm font-heading uppercase tracking-wide"
                    >
                        <button 
                            onClick={() => navigate('/builds')}
                            className="text-text-dim hover:text-accent-blood transition-colors underline underline-offset-4 decoration-dotted"
                        >
                            Ver builds top →
                        </button>
                        <button 
                            onClick={() => navigate('/items')}
                            className="text-text-dim hover:text-accent-blood transition-colors underline underline-offset-4 decoration-dotted"
                        >
                            Explorar wiki →
                        </button>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
