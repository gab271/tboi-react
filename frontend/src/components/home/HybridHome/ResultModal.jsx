// ResultModal.jsx - Modal con resultado del análisis del save file
import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FaTrophy, FaSkull, FaClock, FaTimes, FaChevronRight, FaExclamationTriangle } from 'react-icons/fa';

export function ResultModal({ result, onClose, onRegister }) {
    const { t } = useTranslation();
    
    // ESC key handler
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            onClose();
        }
    }, [onClose]);

    // ESC listener + body scroll lock
    useEffect(() => {
        // Add ESC listener
        document.addEventListener('keydown', handleKeyDown);
        
        // Lock body scroll (preserve scrollbar width)
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        };
    }, [handleKeyDown]);
    
    if (!result) return null;
    
    // CRITICAL: Check if this is demo data
    const isDemo = result.source === 'demo' || result.isDemo === true;
    
    // Safe defaults for optional fields
    const {
        percentage = 0,
        charactersUnlocked = 0,
        totalCharacters = 34,
        itemsFound = 0,
        totalItems = 733,
        completionMarks = 0,
        totalMarks = 408,
        endingsSeen = 0,
        totalEndings = 17,
        topPercentile = 50,
        blockerCharacter = t('home.heroNotAvailable'),
        blockerMarks = '?',
        hoursRemaining = '?',
        mostDeaths = { count: '?', boss: t('common.unknown') },
        nextObjective = t('home.nextObjective')
    } = result || {};

    // Use portal to render directly to body for proper positioning
    const modalContent = (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] overflow-y-auto bg-black/70 backdrop-blur-sm"
            style={{ isolation: 'isolate' }}
            onClick={onClose}
        >
            <div className="min-h-full flex items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: "spring", duration: 0.3 }}
                    className="relative w-full max-w-2xl max-h-[90vh] overflow-auto bg-bg-paper border-[3px] border-black shadow-[8px_8px_0px_#000]"
                    onClick={(e) => e.stopPropagation()}
                >
                {/* Demo warning banner - should never appear with real data */}
                {isDemo && (
                    <div className="bg-accent-gold/20 border-b-2 border-accent-gold px-4 py-3 flex items-center gap-3">
                        <FaExclamationTriangle className="w-5 h-5 text-accent-gold flex-shrink-0" />
                        <div>
                            <p className="font-heading text-sm text-accent-gold">{t('liveActivity.sampleData')}</p>
                            <p className="text-xs text-text-dim">{t('liveActivity.uploadRealSave')}</p>
                        </div>
                    </div>
                )}
                
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-black/10 hover:bg-black hover:text-white transition-colors"
                >
                    <FaTimes className="w-4 h-4" />
                </button>

                {/* Main percentage header */}
                <div className="bg-black text-white p-8 text-center">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', delay: 0.2 }}
                        className="mb-2"
                    >
                        <span className="text-7xl md:text-8xl font-heading text-accent-gold">
                            {percentage}%
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
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 1.5, ease: 'easeOut', delay: 0.4 }}
                                className="h-full bg-gradient-to-r from-accent-gold to-accent-blood rounded-full"
                            />
                        </div>
                    </div>
                </div>

                {/* Stats content */}
                <div className="p-6 md:p-8 space-y-6">
                    {/* Stats grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatBox 
                            label={t('home.charactersLabel')} 
                            current={charactersUnlocked} 
                            total={totalCharacters}
                        />
                        <StatBox 
                            label={t('home.previewItems')} 
                            current={itemsFound} 
                            total={totalItems}
                        />
                        <StatBox 
                            label={t('characters.completionMarks')} 
                            current={completionMarks} 
                            total={totalMarks}
                        />
                        <StatBox 
                            label={t('home.endingsLabel')} 
                            current={endingsSeen} 
                            total={totalEndings}
                        />
                    </div>

                    {/* Insights */}
                    <div className="space-y-3">
                        {/* Social comparison */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            className="flex items-center gap-3 p-4 bg-accent-gold/10 border-2 border-accent-gold/30"
                        >
                            <FaTrophy className="w-6 h-6 text-accent-gold flex-shrink-0" />
                            <div>
                                <p className="font-heading text-lg text-text-heading">
                                    {t('results.topPercentOfPlayers', { percent: topPercentile })}
                                </p>
                                <p className="text-sm text-text-dim font-handwriting">
                                    {t('results.aboveCommunity', { percent: 100 - topPercentile })}
                                </p>
                            </div>
                        </motion.div>

                        {/* Blocker */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 }}
                            className="flex items-center gap-3 p-4 bg-accent-blood/10 border-2 border-accent-blood/30"
                        >
                            <FaSkull className="w-6 h-6 text-accent-blood flex-shrink-0" />
                            <div>
                                <p className="font-heading text-lg text-text-heading">
                                    {blockerCharacter}
                                </p>
                                <p className="text-sm text-text-dim font-handwriting">
                                    {t('results.costingYouMarks', { count: blockerMarks })}
                                </p>
                            </div>
                        </motion.div>

                        {/* Hours remaining */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 }}
                            className="flex items-center gap-3 p-4 bg-green-500/10 border-2 border-green-500/30"
                        >
                            <FaClock className="w-6 h-6 text-green-500 flex-shrink-0" />
                            <div>
                                <p className="font-heading text-lg text-text-heading">
                                    {t('results.hoursRemaining', { hours: hoursRemaining })}
                                </p>
                                <p className="text-sm text-text-dim font-handwriting">
                                    {t('results.estimateToDeadGod')}
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Blurred premium features */}
                    <div className="relative p-4 bg-black/5 border-2 border-dashed border-black/20 overflow-hidden">
                        <div className="blur-sm select-none pointer-events-none">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-xl">💀</span>
                                <div>
                                    <p className="font-heading text-text-heading">
                                        {t('results.deathsAgainst', { count: mostDeaths?.count || '?', boss: mostDeaths?.boss || t('common.unknown') })}
                                    </p>
                                    <p className="text-sm text-text-dim">{t('results.yourHardestBoss')}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xl">📊</span>
                                <div>
                                    <p className="font-heading text-text-heading">{t('liveActivity.fullProgressHistory')}</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-bg-paper/80">
                            <span className="px-4 py-2 bg-black text-white text-sm font-heading">
                                {t('results.createAccountForMoreStats')}
                            </span>
                        </div>
                    </div>

                    {/* Next objective */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                        className="p-4 bg-accent-gold/5 border-2 border-accent-gold/20"
                    >
                        <p className="text-xs text-accent-gold font-heading uppercase mb-1">
                            {t('results.nextObjectiveLabel')}
                        </p>
                        <p className="font-handwriting text-lg text-text-heading">
                            {nextObjective}
                        </p>
                    </motion.div>

                    {/* CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                        className="space-y-3"
                    >
                        <button
                            onClick={onRegister}
                            className="w-full flex items-center justify-center gap-2 py-4 bg-accent-blood text-white font-heading text-lg border-[3px] border-black shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] hover:-translate-y-1 transition-all"
                        >
                            {t('results.saveMyProgress')}
                            <FaChevronRight className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-2 text-text-dim font-handwriting text-sm hover:text-text-heading transition-colors"
                        >
                            {t('results.analyzeAnotherFile')}
                        </button>
                    </motion.div>
                </div>
                </motion.div>
            </div>
        </motion.div>
    );
    
    // Render as portal to body for proper z-index and positioning
    return typeof document !== 'undefined' 
        ? createPortal(modalContent, document.body)
        : null;
}

function StatBox({ label, current, total }) {
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
    
    return (
        <div className="p-3 bg-white/50 border-2 border-black/10 text-center">
            <p className="text-xs text-text-dim font-handwriting mb-1">{label}</p>
            <p className="font-heading text-xl text-text-heading">
                {current}<span className="text-text-dim">/{total}</span>
            </p>
            <div className="mt-2 h-1 bg-black/10 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-accent-blood rounded-full transition-all duration-1000"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
