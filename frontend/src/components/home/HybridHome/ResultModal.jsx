// ResultModal.jsx - Modal con resultado del análisis del save file
import { useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FaTrophy, FaSkull, FaClock, FaTimes, FaChevronRight, FaExclamationTriangle, FaExclamationCircle } from 'react-icons/fa';

// ═══════════════════════════════════════════════════════════════════════════
// SANITY CHECKS - Validate data before rendering
// ═══════════════════════════════════════════════════════════════════════════

function validateAnalysis(data) {
    const errors = [];
    
    if (!data) {
        return { ok: false, errors: ['No data received'] };
    }
    
    // Check for impossible percentages
    if (typeof data.topPercentile === 'number' && (data.topPercentile < 0 || data.topPercentile > 100)) {
        errors.push(`Invalid topPercentile: ${data.topPercentile}`);
    }
    
    // Check endings
    if (typeof data.endingsSeen === 'number' && typeof data.totalEndings === 'number') {
        if (data.endingsSeen > data.totalEndings) {
            errors.push(`Endings exceed total: ${data.endingsSeen}/${data.totalEndings}`);
        }
    }
    
    // Check items
    if (typeof data.itemsFound === 'number' && typeof data.totalItems === 'number') {
        if (data.itemsFound > data.totalItems) {
            errors.push(`Items exceed total: ${data.itemsFound}/${data.totalItems}`);
        }
    }
    
    // Check for impossible state: 0 items but full characters unlocked
    if (data.itemsFound === 0 && data.charactersUnlocked >= 34) {
        errors.push('Parse error: 0 items with 34 characters unlocked');
    }
    
    // Check percentage bounds
    if (typeof data.percentage === 'number' && (data.percentage < 0 || data.percentage > 100)) {
        errors.push(`Invalid percentage: ${data.percentage}`);
    }
    
    return { ok: errors.length === 0, errors };
}

// ═══════════════════════════════════════════════════════════════════════════
// SAFE TEXT HELPER - Never show raw i18n keys
// ═══════════════════════════════════════════════════════════════════════════

function safeT(t, key, fallback, options = {}) {
    const result = t(key, options);
    // If translation returns the key itself, use fallback
    if (result === key || result.startsWith('home.') || result.startsWith('results.')) {
        if (process.env.NODE_ENV === 'development') {
            console.warn(`[i18n] Missing translation for key: ${key}`);
        }
        return fallback;
    }
    return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// ERROR STATE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function ErrorState({ errors, onClose, fileHash, t }) {
    return (
        <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-blood/20 flex items-center justify-center">
                <FaExclamationCircle className="w-8 h-8 text-accent-blood" />
            </div>
            <h3 className="font-heading text-xl text-text-heading mb-2">
                {safeT(t, 'results.parseError', 'Could not read save file')}
            </h3>
            <p className="text-text-dim mb-4 text-sm">
                {safeT(t, 'results.parseErrorDesc', 'The file may be corrupted or from an unsupported version.')}
            </p>
            
            {/* Debug info (only in dev) */}
            {process.env.NODE_ENV === 'development' && errors.length > 0 && (
                <div className="mb-4 p-3 bg-black/5 text-left text-xs font-mono">
                    <p className="text-text-dim mb-1">Debug info:</p>
                    {errors.map((err, i) => (
                        <p key={i} className="text-accent-blood">{err}</p>
                    ))}
                    {fileHash && <p className="text-text-dim mt-1">Hash: {fileHash}</p>}
                </div>
            )}
            
            <button
                onClick={onClose}
                className="px-6 py-3 bg-black text-white font-heading hover:bg-accent-blood transition-colors"
            >
                {safeT(t, 'results.tryAnotherFile', 'Try another file')}
            </button>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN MODAL COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function ResultModal({ result, onClose, onRegister }) {
    const { t } = useTranslation();
    const modalRef = useRef(null);
    const closeButtonRef = useRef(null);
    
    // ESC key handler
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            onClose();
        }
        // Basic focus trap - Tab cycling
        if (e.key === 'Tab' && modalRef.current) {
            const focusableElements = modalRef.current.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement?.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement?.focus();
            }
        }
    }, [onClose]);

    // ESC listener + body scroll lock + initial focus
    useEffect(() => {
        // Add ESC listener
        document.addEventListener('keydown', handleKeyDown);
        
        // Lock body scroll (preserve scrollbar width to prevent layout shift)
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        const originalOverflow = document.body.style.overflow;
        const originalPaddingRight = document.body.style.paddingRight;
        
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        
        // Focus the close button on mount for accessibility
        setTimeout(() => closeButtonRef.current?.focus(), 100);
        
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = originalOverflow;
            document.body.style.paddingRight = originalPaddingRight;
        };
    }, [handleKeyDown]);
    
    if (!result) return null;
    
    // CRITICAL: Check if this is demo data
    const isDemo = result.source === 'demo' || result.isDemo === true;
    
    // Validate data before rendering
    const validation = validateAnalysis(result);
    
    // Safe value extraction with bounds checking
    const percentage = Math.min(100, Math.max(0, result.percentage || 0));
    const charactersUnlocked = result.charactersUnlocked || 0;
    const totalCharacters = result.totalCharacters || 34;
    const itemsFound = result.itemsFound || 0;
    const totalItems = result.totalItems || 733;
    const completionMarks = result.completionMarks || 0;
    const totalMarks = result.totalMarks || 816;
    const endingsSeen = Math.min(result.endingsSeen || 0, result.totalEndings || 17);
    const totalEndings = result.totalEndings || 17;
    
    // Safe topPercentile - null means we don't have this data
    const topPercentile = typeof result.topPercentile === 'number' 
        ? Math.min(100, Math.max(0, result.topPercentile))
        : null;
    
    const blockerCharacter = result.blockerCharacter || null;
    const blockerMarks = result.blockerMarks;
    const hoursRemaining = result.hoursRemaining;
    const mostDeaths = result.mostDeaths || { count: '?', boss: safeT(t, 'common.unknown', 'Unknown') };
    const nextObjective = result.nextObjective || safeT(t, 'home.heroKeepPlaying', 'Keep playing to unlock more!');
    const fileHash = result.fileHash;

    // Use portal to render directly to body for proper positioning
    const modalContent = (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            style={{ isolation: 'isolate' }}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="result-modal-title"
        >
            <motion.div
                ref={modalRef}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", duration: 0.3 }}
                className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-bg-paper border-[3px] border-black shadow-[8px_8px_0px_#000]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    ref={closeButtonRef}
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-black/10 hover:bg-black hover:text-white transition-colors rounded"
                    aria-label="Close modal"
                >
                    <FaTimes className="w-4 h-4" />
                </button>

                {/* Show error state if validation fails */}
                {!validation.ok ? (
                    <ErrorState 
                        errors={validation.errors} 
                        onClose={onClose} 
                        fileHash={fileHash}
                        t={t}
                    />
                ) : (
                    <>
                        {/* Demo warning banner - should never appear with real data */}
                        {isDemo && (
                            <div className="bg-accent-gold/20 border-b-2 border-accent-gold px-4 py-3 flex items-center gap-3">
                                <FaExclamationTriangle className="w-5 h-5 text-accent-gold flex-shrink-0" />
                                <div>
                                    <p className="font-heading text-sm text-accent-gold">
                                        {safeT(t, 'liveActivity.sampleData', 'Sample Data')}
                                    </p>
                                    <p className="text-xs text-text-dim">
                                        {safeT(t, 'liveActivity.uploadRealSave', 'Upload your real save to see your data')}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Main percentage header */}
                        <div className="bg-black text-white p-6 md:p-8 text-center">
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: 'spring', delay: 0.2 }}
                                className="mb-2"
                            >
                                <span 
                                    id="result-modal-title"
                                    className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-heading text-accent-gold"
                                >
                                    {percentage}%
                                </span>
                            </motion.div>
                            <p className="font-handwriting text-lg md:text-xl text-white/80">
                                {safeT(t, 'home.pathToDeadGod', 'path to Dead God')}
                            </p>
                            
                            {/* Progress bar */}
                            <div className="mt-4 md:mt-6 max-w-md mx-auto">
                                <div className="h-3 md:h-4 bg-white/10 rounded-full overflow-hidden">
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
                        <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
                            {/* Stats grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                                <StatBox 
                                    label={safeT(t, 'home.charactersLabel', 'Characters')} 
                                    current={charactersUnlocked} 
                                    total={totalCharacters}
                                />
                                <StatBox 
                                    label={safeT(t, 'home.previewItems', 'Items')} 
                                    current={itemsFound} 
                                    total={totalItems}
                                />
                                <StatBox 
                                    label={safeT(t, 'characters.completionMarks', 'Completion Marks')} 
                                    current={completionMarks} 
                                    total={totalMarks}
                                />
                                <StatBox 
                                    label={safeT(t, 'home.endingsLabel', 'Endings')} 
                                    current={endingsSeen} 
                                    total={totalEndings}
                                />
                            </div>

                            {/* Insights */}
                            <div className="space-y-2 md:space-y-3">
                                {/* Social comparison - only show if we have valid data */}
                                {topPercentile !== null && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.6 }}
                                        className="flex items-center gap-3 p-3 md:p-4 bg-accent-gold/10 border-2 border-accent-gold/30"
                                    >
                                        <FaTrophy className="w-5 h-5 md:w-6 md:h-6 text-accent-gold flex-shrink-0" />
                                        <div>
                                            <p className="font-heading text-base md:text-lg text-text-heading">
                                                {safeT(t, 'results.topPercentOfPlayers', `Top ${topPercentile}% of players`, { percent: topPercentile })}
                                            </p>
                                            <p className="text-xs md:text-sm text-text-dim font-handwriting">
                                                {safeT(t, 'results.aboveCommunity', `You're above ${100 - topPercentile}% of the community`, { percent: 100 - topPercentile })}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Blocker - only show if we have data */}
                                {blockerCharacter && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.7 }}
                                        className="flex items-center gap-3 p-3 md:p-4 bg-accent-blood/10 border-2 border-accent-blood/30"
                                    >
                                        <FaSkull className="w-5 h-5 md:w-6 md:h-6 text-accent-blood flex-shrink-0" />
                                        <div>
                                            <p className="font-heading text-base md:text-lg text-text-heading">
                                                {blockerCharacter}
                                            </p>
                                            <p className="text-xs md:text-sm text-text-dim font-handwriting">
                                                {typeof blockerMarks === 'number' 
                                                    ? safeT(t, 'results.costingYouMarks', `is costing you ${blockerMarks} marks`, { count: blockerMarks })
                                                    : safeT(t, 'results.needsCompletion', 'needs completion marks')
                                                }
                                            </p>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Hours remaining - only show if we have data */}
                                {hoursRemaining && hoursRemaining !== '?' && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.8 }}
                                        className="flex items-center gap-3 p-3 md:p-4 bg-green-500/10 border-2 border-green-500/30"
                                    >
                                        <FaClock className="w-5 h-5 md:w-6 md:h-6 text-green-500 flex-shrink-0" />
                                        <div>
                                            <p className="font-heading text-base md:text-lg text-text-heading">
                                                {safeT(t, 'results.hoursRemaining', `~${hoursRemaining} hours remaining`, { hours: hoursRemaining })}
                                            </p>
                                            <p className="text-xs md:text-sm text-text-dim font-handwriting">
                                                {safeT(t, 'results.estimateToDeadGod', 'estimate to Dead God')}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {/* Blurred premium features */}
                            <div className="relative p-3 md:p-4 bg-black/5 border-2 border-dashed border-black/20 overflow-hidden">
                                <div className="blur-sm select-none pointer-events-none">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-lg md:text-xl">💀</span>
                                        <div>
                                            <p className="font-heading text-sm md:text-base text-text-heading">
                                                {safeT(t, 'results.deathsAgainst', `${mostDeaths?.count || '?'} deaths against ${mostDeaths?.boss || 'Unknown'}`, { count: mostDeaths?.count || '?', boss: mostDeaths?.boss || 'Unknown' })}
                                            </p>
                                            <p className="text-xs md:text-sm text-text-dim">
                                                {safeT(t, 'results.yourHardestBoss', 'Your hardest boss')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg md:text-xl">📊</span>
                                        <div>
                                            <p className="font-heading text-sm md:text-base text-text-heading">
                                                {safeT(t, 'liveActivity.fullProgressHistory', 'Full progress history')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center bg-bg-paper/80">
                                    <span className="px-3 md:px-4 py-2 bg-black text-white text-xs md:text-sm font-heading text-center">
                                        {safeT(t, 'results.createAccountForMoreStats', 'Create account to see more stats')}
                                    </span>
                                </div>
                            </div>

                            {/* Next objective */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.9 }}
                                className="p-3 md:p-4 bg-accent-gold/5 border-2 border-accent-gold/20"
                            >
                                <p className="text-xs text-accent-gold font-heading uppercase mb-1">
                                    {safeT(t, 'results.nextObjectiveLabel', 'Next objective')}
                                </p>
                                <p className="font-handwriting text-base md:text-lg text-text-heading">
                                    {nextObjective}
                                </p>
                            </motion.div>

                            {/* CTA - Always visible, never cut off */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1 }}
                                className="space-y-2 md:space-y-3 pb-2"
                            >
                                <button
                                    onClick={onRegister}
                                    className="w-full flex items-center justify-center gap-2 py-3 md:py-4 bg-accent-blood text-white font-heading text-base md:text-lg border-[3px] border-black shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] hover:-translate-y-1 transition-all"
                                >
                                    {safeT(t, 'results.saveMyProgress', 'Save my progress (free)')}
                                    <FaChevronRight className="w-3 h-3 md:w-4 md:h-4" />
                                </button>
                                <button
                                    onClick={onClose}
                                    className="w-full py-2 text-text-dim font-handwriting text-sm hover:text-text-heading transition-colors"
                                >
                                    {safeT(t, 'results.analyzeAnotherFile', 'Analyze another file')}
                                </button>
                            </motion.div>
                        </div>
                    </>
                )}
            </motion.div>
        </motion.div>
    );
    
    // Render as portal to body for proper z-index and positioning
    return typeof document !== 'undefined' 
        ? createPortal(modalContent, document.body)
        : null;
}

// ═══════════════════════════════════════════════════════════════════════════
// STAT BOX COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function StatBox({ label, current, total }) {
    // Ensure percentage is always valid
    const percentage = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
    
    return (
        <div className="p-2 md:p-3 bg-white/50 border-2 border-black/10 text-center">
            <p className="text-xs text-text-dim font-handwriting mb-1 truncate">{label}</p>
            <p className="font-heading text-lg md:text-xl text-text-heading">
                {current}<span className="text-text-dim">/{total}</span>
            </p>
            <div className="mt-1 md:mt-2 h-1 bg-black/10 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-accent-blood rounded-full transition-all duration-1000"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
