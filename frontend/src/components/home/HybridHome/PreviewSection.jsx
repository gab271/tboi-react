// PreviewSection.jsx - Muestra resultado ficticio para generar deseo
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useInView } from 'framer-motion';
import { FaTrophy, FaSkull, FaClock, FaChevronRight } from 'react-icons/fa';

// Hook for animated counting numbers
function useCountUp(end, duration = 1500, delay = 0, start = 0) {
    const [count, setCount] = useState(start);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
    const hasAnimated = useRef(false);

    useEffect(() => {
        if (!isInView || hasAnimated.current) return;
        
        const startTime = Date.now() + delay;
        hasAnimated.current = true;

        const animate = () => {
            const now = Date.now();
            if (now < startTime) {
                requestAnimationFrame(animate);
                return;
            }

            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (easeOutQuart)
            const eased = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.round(start + (end - start) * eased);
            
            setCount(currentValue);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }, [isInView, end, duration, delay, start]);

    return { count, ref };
}

// Datos de ejemplo para mostrar antes del registro
const PREVIEW_DATA = {
    percentage: 67,
    topPercentile: 23,
    characters: { current: 31, total: 34 },
    items: { current: 489, total: 637 },
    marks: { current: 287, total: 408 },
    endings: { current: 12, total: 17 },
    blocker: { character: 'Tainted Lazarus', marks: 14 },
    hoursRemaining: 23,
};

export function PreviewSection({ onCTAClick }) {
    const { t } = useTranslation();
    const { count: animatedPercentage, ref: percentRef } = useCountUp(PREVIEW_DATA.percentage, 2000, 300);
    
    return (
        <section id="preview-section" className="relative w-full px-4 md:px-8 py-20 md:py-24 bg-gradient-to-b from-transparent via-black/5 to-transparent">
            <div className="max-w-4xl mx-auto">
                {/* Section header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-10"
                >
                    <h2 className="font-heading text-2xl md:text-3xl text-text-heading uppercase tracking-wider mb-2">
                        {t('home.previewTitle')}
                    </h2>
                    <p className="font-handwriting text-lg text-text-dim">
                        {t('home.previewSubtitle')}
                    </p>
                </motion.div>

                {/* Preview Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="relative bg-bg-paper border-[3px] border-black shadow-[8px_8px_0px_#000] overflow-hidden"
                >
                    {/* Decorative corner */}
                    <div className="absolute top-0 right-0 w-16 h-16 bg-accent-gold/20" 
                         style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} 
                    />

                    {/* Main percentage */}
                    <div className="bg-black text-white p-8 text-center" ref={percentRef}>
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ type: 'spring', delay: 0.3 }}
                            className="mb-2"
                        >
                            <span className="text-6xl md:text-8xl font-heading text-accent-gold tabular-nums">
                                {animatedPercentage}%
                            </span>
                        </motion.div>
                        <p className="font-handwriting text-xl text-white/80">
                            {t('home.pathToDeadGod')}
                        </p>
                        
                        {/* Progress bar */}
                        <div className="mt-6 max-w-md mx-auto">
                            <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${PREVIEW_DATA.percentage}%` }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
                                    className="h-full bg-gradient-to-r from-accent-gold to-accent-blood rounded-full"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Stats grid */}
                    <div className="p-6 md:p-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <StatBox 
                                label={t('home.charactersLabel')} 
                                current={PREVIEW_DATA.characters.current} 
                                total={PREVIEW_DATA.characters.total}
                                delay={0.1}
                            />
                            <StatBox 
                                label={t('home.previewItems')} 
                                current={PREVIEW_DATA.items.current} 
                                total={PREVIEW_DATA.items.total}
                                delay={0.2}
                            />
                            <StatBox 
                                label={t('characters.completionMarks')} 
                                current={PREVIEW_DATA.marks.current} 
                                total={PREVIEW_DATA.marks.total}
                                delay={0.3}
                            />
                            <StatBox 
                                label={t('home.endingsLabel')} 
                                current={PREVIEW_DATA.endings.current} 
                                total={PREVIEW_DATA.endings.total}
                                delay={0.4}
                            />
                        </div>

                        {/* Insights row */}
                        <div className="grid md:grid-cols-3 gap-4 mb-6">
                            {/* Social comparison */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.5 }}
                                className="flex items-center gap-3 p-4 bg-accent-gold/10 border-2 border-accent-gold/30"
                            >
                                <FaTrophy className="w-6 h-6 text-accent-gold flex-shrink-0" />
                                <div>
                                    <p className="font-heading text-lg text-text-heading">Top {PREVIEW_DATA.topPercentile}%</p>
                                    <p className="text-xs text-text-dim font-handwriting">{t('home.ofAllPlayers')}</p>
                                </div>
                            </motion.div>

                            {/* Blocker */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.6 }}
                                className="flex items-center gap-3 p-4 bg-accent-blood/10 border-2 border-accent-blood/30"
                            >
                                <FaSkull className="w-6 h-6 text-accent-blood flex-shrink-0" />
                                <div>
                                    <p className="font-heading text-sm text-text-heading">{PREVIEW_DATA.blocker.character}</p>
                                    <p className="text-xs text-text-dim font-handwriting">{t('home.previewBlockerCosts', { count: PREVIEW_DATA.blocker.marks })}</p>
                                </div>
                            </motion.div>

                            {/* Hours remaining */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.7 }}
                                className="flex items-center gap-3 p-4 bg-green-500/10 border-2 border-green-500/30"
                            >
                                <FaClock className="w-6 h-6 text-green-500 flex-shrink-0" />
                                <div>
                                    <p className="font-heading text-lg text-text-heading">~{PREVIEW_DATA.hoursRemaining}h</p>
                                    <p className="text-xs text-text-dim font-handwriting">{t('home.previewForDeadGod')}</p>
                                </div>
                            </motion.div>
                        </div>

                        {/* CTA */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.8 }}
                            className="text-center"
                        >
                            <button
                                onClick={onCTAClick}
                                className="inline-flex items-center gap-2 px-8 py-4 bg-accent-blood text-white font-heading text-lg border-[3px] border-black shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] hover:-translate-y-1 transition-all"
                            >
                                {t('home.previewViewMyProgress')}
                                <FaChevronRight className="w-4 h-4" />
                            </button>
                            <p className="mt-3 text-sm text-text-dim font-handwriting">
                                {t('home.previewUploadToDiscover')}
                            </p>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

function StatBox({ label, current, total, delay }) {
    const percentage = Math.round((current / total) * 100);
    const { count: animatedCurrent, ref } = useCountUp(current, 1200, delay * 1000);
    
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay }}
            className="p-4 bg-white/50 border-2 border-black/10 text-center"
        >
            <p className="text-xs text-text-dim font-handwriting mb-1">{label}</p>
            <p className="font-heading text-2xl text-text-heading">
                <span className="tabular-nums">{animatedCurrent}</span>
                <span className="text-text-dim">/{total}</span>
            </p>
            <div className="mt-2 h-1.5 bg-black/10 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${percentage}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: 'easeOut', delay: delay + 0.3 }}
                    className="h-full bg-accent-blood rounded-full"
                />
            </div>
        </motion.div>
    );
}
