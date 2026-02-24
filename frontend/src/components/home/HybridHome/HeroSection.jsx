// HeroSection.jsx - Hero con foco único pero sugiere más contenido
import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaUpload, FaQuestionCircle, FaChevronDown, FaExclamationTriangle, FaBolt } from 'react-icons/fa';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../lib/utils';
import { analyzeSaveFile, fetchDailyStats } from '../../../lib/api';

export function HeroSection({ onUploadSuccess, resetRef }) {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [uploadState, setUploadState] = useState('idle'); // idle | uploading | success | error
    const [errorMessage, setErrorMessage] = useState('');
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [dailyCount, setDailyCount] = useState(null);

    // Expose reset function to parent via ref
    useEffect(() => {
        if (resetRef) {
            resetRef.current = () => {
                setUploadState('idle');
                setErrorMessage('');
            };
        }
    }, [resetRef]);

    // Fetch daily stats on mount
    useEffect(() => {
        const loadStats = async () => {
            try {
                const data = await fetchDailyStats();
                if (data.ok && data.stats) {
                    setDailyCount(data.stats.analyzedToday);
                }
            } catch (error) {
                console.log('[HeroSection] Failed to load daily stats:', error);
                // Silently fail - counter is non-critical
            }
        };
        loadStats();
        
        // Refresh every 60 seconds
        const interval = setInterval(loadStats, 60000);
        return () => clearInterval(interval);
    }, []);

    const onDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        // Validate file name
        if (!file.name.includes('rep_') && !file.name.includes('persistentgamedata')) {
            setUploadState('error');
            setErrorMessage(t('home.heroInvalidFile'));
            return;
        }

        setUploadState('uploading');
        setErrorMessage('');
        
        // Calculate file hash for debugging/verification
        let fileHash = null;
        try {
            const arrayBuffer = await file.arrayBuffer();
            const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            fileHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
            console.log('[HeroSection] File info:', {
                name: file.name,
                size: file.size,
                lastModified: new Date(file.lastModified).toISOString(),
                sha256: fileHash
            });
        } catch (e) {
            console.warn('[HeroSection] Could not calculate file hash:', e);
        }

        try {
            // REAL API CALL - no more mock data
            const result = await analyzeSaveFile(file);
            
            // Debug: Log response to verify file was processed
            console.log('[HeroSection] API Response:', {
                ok: result.ok,
                source: result.source,
                backendHash: result.metadata?.fileHash,
                frontendHash: fileHash?.substring(0, 8),
                hashMatch: fileHash?.substring(0, 8) === result.metadata?.fileHash,
                deadGodPercentage: result.metrics?.deadGodPercentage,
                secretsCount: result.secrets?.count,
                itemsCount: result.items?.count,
                parseTimeMs: result.metadata?.parseTimeMs
            });
            
            // Validate source is real data
            if (result.source !== 'real') {
                console.warn('[HeroSection] Received non-real source:', result.source);
                setUploadState('error');
                setErrorMessage(t('home.heroAnalysisFailed'));
                return;
            }

            // Transform V2 API response to UI format
            // V2 parser returns data at root level, not inside 'parsed'
            const characters = result.characters || {};
            const charArray = Object.values(characters);
            const completedCharCount = charArray.filter(c => c.percentage === 100).length;
            const vanillaChars = charArray.filter(c => !c.isTainted);
            const taintedChars = charArray.filter(c => c.isTainted);
            
            const uiResult = {
                // Source tracking - CRITICAL
                source: result.source,
                isDemo: false,
                
                // Main percentage (Dead God progress)
                percentage: result.metrics?.deadGodPercentage || 0,
                topPercentile: result.metrics?.topPercentile || null,
                
                // Characters
                charactersUnlocked: charArray.length,
                totalCharacters: charArray.length || 34,
                completedCharacters: completedCharCount,
                
                // Items
                itemsFound: result.items?.count || 0,
                totalItems: result.items?.total || 637,
                
                // Completion marks
                completionMarks: result.totalMarks || 0,
                totalMarks: result.totalMarksExpected || 816,
                marksPercentage: result.metrics?.marksPercentage || 0,
                
                // Achievements (secrets in V2)
                achievementsUnlocked: result.secrets?.count || 0,
                totalAchievements: result.secrets?.total || 637,
                
                // Endings (derived from character marks in V2)
                endingsSeen: result.endings?.count || 0,
                totalEndings: result.endings?.total || 17,
                
                // Blocker info (from nextSteps in V2)
                blockerCharacter: result.nextSteps?.[0]?.characterName || null,
                blockerMarks: result.nextSteps?.[0]?.missingMarks || [],
                
                // Time estimate
                hoursRemaining: result.metrics?.estimatedHoursRemaining || null,
                
                // Next objective (first nextStep in V2)
                nextObjective: result.nextSteps?.[0]?.description || t('home.heroKeepPlaying'),
                
                // Most deaths (placeholder - not tracked in save file)
                mostDeaths: { count: '?', boss: t('home.heroNotAvailable') },
                
                // Tainted progress
                taintedCompletion: result.metrics?.taintedCompletion || 0,
                vanillaCompleted: vanillaChars.filter(c => c.percentage === 100).length,
                taintedCompleted: taintedChars.filter(c => c.percentage === 100).length,
                
                // File metadata (in metadata object in V2)
                slot: result.metadata?.slot || 1,
                fileHash: result.metadata?.fileHash || null,
                uploadedAt: result.metadata?.parsedAt || new Date().toISOString(),
                
                // Full character data for detailed view
                characters: characters,
                
                // Additional V2 data
                sanityChecks: result.sanityChecks,
                missing: result.missing,
                nextSteps: result.nextSteps
            };
            
            setUploadState('success');
            onUploadSuccess?.(uiResult);
            
        } catch (error) {
            console.error('[HeroSection] Upload error:', error);
            setUploadState('error');
            setErrorMessage(
                error.response?.error_message || 
                error.message || 
                t('home.heroGenericError')
            );
        }
    }, [onUploadSuccess]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/octet-stream': ['.dat'] },
        maxFiles: 1,
        disabled: uploadState === 'uploading',
    });

    const resetUpload = () => {
        setUploadState('idle');
        setErrorMessage('');
    };

    const scrollToPreview = () => {
        document.getElementById('preview-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section className="relative w-full min-h-[85vh] flex items-center py-8 md:py-16 overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-20 left-10 w-64 h-64 bg-accent-blood opacity-5 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-black opacity-10 rounded-full blur-3xl" />
                
                {/* Floating sprites */}
                <motion.img
                    src="/sprites/1_Passive Items/Brimstone.png"
                    alt=""
                    className="absolute top-1/4 right-[15%] w-12 h-12 pixelated opacity-15 hidden lg:block"
                    animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.img
                    src="/sprites/1_Passive Items/Sacred Heart.png"
                    alt=""
                    className="absolute top-1/2 right-[8%] w-10 h-10 pixelated opacity-10 hidden lg:block"
                    animate={{ y: [0, -8, 0], rotate: [0, -5, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                />
            </div>

            <div className="relative z-10 w-full max-w-4xl mx-auto px-4 md:px-8">
                <div className="flex flex-col items-center text-center">
                    
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6"
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-accent-gold/10 border border-accent-gold/30 text-accent-gold font-heading text-sm uppercase tracking-wider">
                            <span className="w-2 h-2 bg-accent-gold rounded-full animate-pulse" />
                            {t('home.heroTracker')}
                        </span>
                    </motion.div>

                    {/* H1 */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading text-text-heading leading-[0.95] tracking-tight mb-4"
                    >
                        {t('home.heroHowMuchLeft')}
                        <br />
                        <span className="text-accent-gold">{t('home.deadGod')}</span>?
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl lg:text-2xl font-handwriting text-text-ink/80 max-w-xl mb-4"
                    >
                        {t('home.heroUploadDescription')}
                    </motion.p>

                    {/* Live Counter */}
                    {dailyCount !== null && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.25 }}
                            className="flex items-center gap-2 mb-8 px-4 py-2 bg-black/5 border border-black/10 rounded-full"
                        >
                            <FaBolt className="w-3 h-3 text-accent-gold" />
                            <span className="font-heading text-sm text-text-dim">
                                <motion.span
                                    key={dailyCount}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-text-heading font-bold"
                                >
                                    {dailyCount.toLocaleString()}
                                </motion.span>
                                {' '}{t('home.heroSavesAnalyzedToday')}
                            </span>
                        </motion.div>
                    )}

                    {/* Upload Zone */}
                    <AnimatePresence mode="wait">
                        {uploadState === 'idle' && (
                            <motion.div
                                id="upload-zone"
                                key="upload"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ delay: 0.3 }}
                                className="w-full max-w-lg transition-all duration-300"
                            >
                                <div
                                    {...getRootProps()}
                                    className={cn(
                                        "relative border-[3px] border-dashed p-8 md:p-10 cursor-pointer transition-all",
                                        isDragActive 
                                            ? "border-accent-gold bg-accent-gold/10" 
                                            : "border-black/30 bg-bg-paper hover:border-accent-blood hover:bg-accent-blood/5"
                                    )}
                                >
                                    <input {...getInputProps()} />
                                    
                                    <div className="flex flex-col items-center gap-4">
                                        <div className={cn(
                                            "w-16 h-16 rounded-full flex items-center justify-center transition-colors",
                                            isDragActive ? "bg-accent-gold text-black" : "bg-black text-white"
                                        )}>
                                            <FaUpload className="w-6 h-6" />
                                        </div>
                                        
                                        <div>
                                            <p className="font-heading text-lg md:text-xl text-text-heading mb-1">
                                                {isDragActive ? t('home.heroDropHere') : t('home.heroDragSaveFile')}
                                            </p>
                                            <p className="text-sm text-text-dim font-handwriting">
                                                {t('home.heroOrClickToSelect')}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Microcopy */}
                                <div className="mt-4 flex flex-col items-center gap-3">
                                    <div className="flex items-center gap-2 text-sm text-text-dim">
                                        <span className="text-lg">🔒</span>
                                        <span className="font-sans">{t('home.heroPrivacyNote')}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowHelpModal(true);
                                            }}
                                            className="flex items-center gap-1 text-accent-blood hover:underline"
                                        >
                                            <FaQuestionCircle className="w-3 h-3" />
                                            {t('home.heroWhereIsMySave')}
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                scrollToPreview();
                                            }}
                                            className="text-text-dim hover:text-text-heading transition-colors"
                                        >
                                            {t('home.heroSeeExample')}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {uploadState === 'uploading' && (
                            <motion.div
                                key="uploading"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="w-full max-w-lg bg-bg-paper border-2 border-black p-8 shadow-[4px_4px_0px_#000]"
                            >
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-12 h-12 border-4 border-accent-blood border-t-transparent rounded-full animate-spin" />
                                    <p className="font-heading text-xl">{t('home.heroAnalyzingItems')}</p>
                                    <div className="w-full h-2 bg-black/10 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: '100%' }}
                                            transition={{ duration: 2.5, ease: 'easeInOut' }}
                                            className="h-full bg-accent-blood"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {uploadState === 'error' && (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="w-full max-w-lg bg-accent-blood/10 border-2 border-accent-blood p-6"
                            >
                                <div className="flex items-start gap-3 mb-3">
                                    <FaExclamationTriangle className="w-5 h-5 text-accent-blood flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-heading text-accent-blood mb-1">{t('home.heroErrorTitle')}</p>
                                        <p className="text-sm text-text-dim">
                                            {errorMessage || t('home.heroErrorDefault')}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-xs text-text-dim mb-4 pl-8">
                                    {t('home.heroErrorHint')} <code className="bg-black/10 px-1 rounded">rep_persistentgamedata1.dat</code> {t('home.heroErrorHintSuffix')}
                                </p>
                                <button
                                    onClick={resetUpload}
                                    className="px-4 py-2 bg-black text-white font-heading text-sm hover:bg-accent-blood transition-colors"
                                >
                                    {t('home.heroTryAgain')}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Scroll hint - CRÍTICO para sugerir más contenido */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mt-12"
                    >
                        <button
                            onClick={scrollToPreview}
                            className="flex flex-col items-center gap-2 text-text-dim hover:text-accent-blood transition-colors group"
                        >
                            <span className="text-sm font-handwriting">
                                {t('home.heroScrollHint')}
                            </span>
                            <FaChevronDown className="w-4 h-4 animate-bounce group-hover:text-accent-blood" />
                        </button>
                    </motion.div>
                </div>
            </div>

            {/* Help Modal */}
            <AnimatePresence>
                {showHelpModal && (
                    <HelpModal onClose={() => setShowHelpModal(false)} />
                )}
            </AnimatePresence>
        </section>
    );
}

function HelpModal({ onClose }) {
    const { t } = useTranslation();
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-black/50"
            onClick={onClose}
        >
            {/* Centering container that accounts for scroll */}
            <div className="min-h-full flex items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={{ type: "spring", duration: 0.3 }}
                    className="relative w-full max-w-md bg-bg-paper border-[3px] border-black shadow-[6px_6px_0px_#000] p-6"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h3 className="font-heading text-xl text-text-heading mb-4">
                        {t('home.heroHelpTitle')}
                    </h3>

                <div className="space-y-4 text-sm">
                    <div>
                        <p className="font-heading text-accent-blood mb-1">Windows:</p>
                        <code className="block p-2 bg-black/5 text-xs break-all font-mono">
                            C:\Users\TU_USUARIO\Documents\My Games\Binding of Isaac Repentance\
                        </code>
                    </div>

                    <div>
                        <p className="font-heading text-accent-blood mb-1">Mac:</p>
                        <code className="block p-2 bg-black/5 text-xs break-all font-mono">
                            ~/Library/Application Support/Binding of Isaac Repentance/
                        </code>
                    </div>

                    <div>
                        <p className="font-heading text-accent-blood mb-1">Linux:</p>
                        <code className="block p-2 bg-black/5 text-xs break-all font-mono">
                            ~/.local/share/binding of isaac repentance/
                        </code>
                    </div>

                    <p className="text-text-dim font-handwriting pt-2 border-t border-black/10">
                        {t('home.heroLookForFile')} <strong>rep_persistentgamedata1.dat</strong>
                    </p>
                </div>

                <button
                    onClick={onClose}
                    className="mt-6 w-full py-3 bg-black text-white font-heading hover:bg-accent-blood transition-colors"
                >
                    {t('home.heroGotIt')}
                </button>
                </motion.div>
            </div>
        </motion.div>
    );
}
