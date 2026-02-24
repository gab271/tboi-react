// NewHero.jsx - Redesigned hero focused on single action: upload save file
import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaUpload, FaQuestionCircle, FaUsers, FaSpinner, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { useDropzone } from 'react-dropzone';
import { cn } from '../../lib/utils';
import { analyzeSaveFile } from '../../lib/api';

// Mock community stats
const COMMUNITY_STATS = {
    usersTracking: 3247,
    uploadsToday: 847,
};

export function NewHero() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [uploadState, setUploadState] = useState('idle'); // idle | uploading | success | error
    const [progress, setProgress] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [showHelpModal, setShowHelpModal] = useState(false);

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

        try {
            // REAL API CALL
            const result = await analyzeSaveFile(file);
            
            if (result.source !== 'real') {
                setUploadState('error');
                setErrorMessage(t('home.heroAnalysisFailed'));
                return;
            }
            
            setUploadState('success');
            setProgress({
                source: result.source,
                percentage: result.metrics.deadGodPercentage,
                topPercentile: result.metrics.topPercentile,
                blockerCharacter: result.parsed.blockerCharacter,
                blockerMarks: result.parsed.blockerMarks,
                hoursRemaining: result.metrics.estimatedHoursRemaining,
                nextObjective: result.parsed.nextObjective,
                completionMarks: result.parsed.completionMarks,
                totalMarks: result.parsed.totalMarks,
                achievementsUnlocked: result.parsed.achievementsUnlocked,
                totalAchievements: result.parsed.totalAchievements,
            });
        } catch (error) {
            console.error('[NewHero] Upload error:', error);
            setUploadState('error');
            setErrorMessage(
                error.response?.error_message || 
                error.message || 
                'Error al analizar el archivo.'
            );
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/octet-stream': ['.dat'],
        },
        maxFiles: 1,
        disabled: uploadState === 'uploading',
    });

    const resetUpload = () => {
        setUploadState('idle');
        setProgress(null);
        setErrorMessage('');
    };

    return (
        <section className="relative w-full min-h-[85vh] flex items-center py-8 md:py-16 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-20 left-10 w-64 h-64 bg-accent-blood opacity-5 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-black opacity-10 rounded-full blur-3xl" />
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
                        {t('home.heroQuestion')}
                        <br />
                        <span className="text-accent-gold">Dead God</span>?
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl lg:text-2xl font-handwriting text-text-ink/80 max-w-xl mb-8"
                    >
                        {t('home.heroPlayersKnow', { count: COMMUNITY_STATS.usersTracking.toLocaleString() })}
                    </motion.p>

                    {/* Upload Zone or Results */}
                    <AnimatePresence mode="wait">
                        {uploadState === 'idle' && (
                            <motion.div
                                key="upload"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ delay: 0.3 }}
                                className="w-full max-w-lg"
                            >
                                {/* Drop Zone */}
                                <div
                                    {...getRootProps()}
                                    className={cn(
                                        "relative border-3 border-dashed p-8 md:p-12 cursor-pointer transition-all",
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
                                <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-text-dim">
                                    <span className="font-sans">{t('home.heroFreePrivate')}</span>
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
                                </div>

                                {/* Social proof line */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="mt-6 flex items-center justify-center gap-2 text-sm text-text-dim"
                                >
                                    <FaUsers className="w-4 h-4" />
                                    <span>{t('home.heroAnalysisToday', { count: COMMUNITY_STATS.uploadsToday })}</span>
                                </motion.div>
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
                                    <FaSpinner className="w-12 h-12 text-accent-blood animate-spin" />
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

                        {uploadState === 'success' && progress && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="w-full max-w-2xl"
                            >
                                <ResultPreview 
                                    progress={progress} 
                                    onReset={resetUpload}
                                    onRegister={() => navigate('/auth/register')}
                                    t={t}
                                />
                            </motion.div>
                        )}

                        {uploadState === 'error' && (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="w-full max-w-lg bg-accent-blood/10 border-2 border-accent-blood p-6"
                            >
                                <p className="font-heading text-accent-blood mb-2">{t('home.heroFileNotRecognized')}</p>
                                <p className="text-sm text-text-dim mb-4">
                                    {t('home.heroMakeSureUpload')}
                                </p>
                                <button
                                    onClick={resetUpload}
                                    className="px-4 py-2 bg-black text-white font-heading text-sm"
                                >
                                    {t('home.heroTryAgain')}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Help Modal */}
            <AnimatePresence>
                {showHelpModal && (
                    <HelpModal onClose={() => setShowHelpModal(false)} t={t} />
                )}
            </AnimatePresence>
        </section>
    );
}

// Result Preview Component (shows after upload, before registration)
function ResultPreview({ progress, onReset, onRegister, t }) {
    return (
        <div className="bg-bg-paper border-3 border-black shadow-[6px_6px_0px_#000] overflow-hidden">
            {/* Header with main percentage */}
            <div className="bg-black text-white p-6 text-center">
                <motion.p
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="text-6xl md:text-8xl font-heading text-accent-gold mb-2"
                >
                    {progress.percentage}%
                </motion.p>
                <p className="font-handwriting text-lg text-white/80">{t('home.pathToDeadGod')}</p>
            </div>

            {/* Stats preview */}
            <div className="p-6 space-y-4">
                {/* Social comparison */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-3 p-4 bg-accent-gold/10 border border-accent-gold/30"
                >
                    <span className="text-2xl">🏆</span>
                    <div>
                        <p className="font-heading text-text-heading">Top {progress.topPercentile}%</p>
                        <p className="text-sm text-text-dim font-handwriting">{t('home.ofAllPlayers')}</p>
                    </div>
                </motion.div>

                {/* Blocker character */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center gap-3 p-4 bg-accent-blood/10 border border-accent-blood/30"
                >
                    <span className="text-2xl">🚨</span>
                    <div>
                        <p className="font-heading text-text-heading">{progress.blockerCharacter}</p>
                        <p className="text-sm text-text-dim font-handwriting">
                            {t('home.costingYouMarks', { count: progress.blockerMarks })}
                        </p>
                    </div>
                </motion.div>

                {/* Most deaths - blurred teaser */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="relative flex items-center gap-3 p-4 bg-black/5 border border-black/10 overflow-hidden"
                >
                    <span className="text-2xl">💀</span>
                    <div className="blur-sm select-none">
                        <p className="font-heading text-text-heading">{progress.mostDeaths?.count || 0} {t('weekly.runs')}</p>
                        <p className="text-sm text-text-dim">{progress.mostDeaths?.boss || ''}</p>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                        <span className="text-xs font-heading text-text-dim uppercase">{t('home.createAccountToSee')}</span>
                    </div>
                </motion.div>

                {/* Next objective - visible */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                    className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30"
                >
                    <span className="text-2xl">✅</span>
                    <div>
                        <p className="font-heading text-text-heading text-sm">{t('home.nextObjectiveLabel')}</p>
                        <p className="text-sm text-text-dim font-handwriting">{progress.nextObjective}</p>
                    </div>
                </motion.div>
            </div>

            {/* CTA */}
            <div className="p-6 pt-0 space-y-3">
                <button
                    onClick={onRegister}
                    className="w-full py-4 bg-accent-blood text-white font-heading text-lg border-2 border-black shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] hover:-translate-y-1 transition-all"
                >
                    {t('home.saveMyProgress')}
                </button>
                <button
                    onClick={onReset}
                    className="w-full py-2 text-text-dim font-handwriting text-sm hover:text-text-heading transition-colors"
                >
                    {t('home.analyzeAnotherFile')}
                </button>
            </div>
        </div>
    );
}

// Help Modal for finding save file
function HelpModal({ onClose, t }) {
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
                    className="relative w-full max-w-md bg-bg-paper border-3 border-black shadow-[6px_6px_0px_#000] p-6"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h3 className="font-heading text-xl text-text-heading mb-4">
                        {t('home.helpModalTitle')}
                    </h3>

                    <div className="space-y-4 text-sm">
                        <div>
                            <p className="font-heading text-accent-blood mb-1">Windows:</p>
                            <code className="block p-2 bg-black/5 text-xs break-all">
                                C:\Users\YOUR_USER\Documents\My Games\Binding of Isaac Repentance\
                            </code>
                        </div>

                        <div>
                            <p className="font-heading text-accent-blood mb-1">Mac:</p>
                            <code className="block p-2 bg-black/5 text-xs break-all">
                                ~/Library/Application Support/Binding of Isaac Repentance/
                            </code>
                        </div>

                        <div>
                            <p className="font-heading text-accent-blood mb-1">Linux:</p>
                            <code className="block p-2 bg-black/5 text-xs break-all">
                                ~/.local/share/binding of isaac repentance/
                            </code>
                        </div>

                        <p className="text-text-dim font-handwriting">
                            {t('home.lookForFile')} <strong>rep_persistentgamedata1.dat</strong>
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="mt-6 w-full py-3 bg-black text-white font-heading"
                    >
                        {t('home.understood')}
                    </button>
                </motion.div>
            </div>
        </motion.div>
    );
}
