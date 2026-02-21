// MobileStickyCTA.jsx - Sticky bottom bar for mobile navigation
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChartLine, FaTrophy } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';

export function MobileStickyCTA() {
    const [isVisible, setIsVisible] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            // Show after scrolling 300px
            setIsVisible(window.scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToAnalyzer = () => {
        document.getElementById('item-analyzer')?.scrollIntoView({ behavior: 'smooth' });
    };

    const scrollToProgress = () => {
        document.getElementById('progress-tracker')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
                >
                    {/* Shadow overlay */}
                    <div className="absolute inset-x-0 -top-4 h-4 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
                    
                    {/* CTA bar */}
                    <div className="bg-bg-paper border-t-2 border-black p-3 flex gap-3 safe-area-inset-bottom">
                        <button
                            onClick={scrollToAnalyzer}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-accent-blood text-white font-heading text-sm border-2 border-black shadow-[2px_2px_0px_#000] active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
                        >
                            <FaChartLine className="w-4 h-4" />
                            Analizar
                        </button>
                        <button
                            onClick={scrollToProgress}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-accent-gold text-black font-heading text-sm border-2 border-black shadow-[2px_2px_0px_#000] active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
                        >
                            <FaTrophy className="w-4 h-4" />
                            Progreso
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
