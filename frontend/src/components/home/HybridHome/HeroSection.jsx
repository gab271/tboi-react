// HeroSection.jsx - Hero con foco único pero sugiere más contenido
import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaUpload, FaQuestionCircle, FaChevronDown, FaExclamationTriangle, FaBolt, FaSpinner, FaTimes } from 'react-icons/fa';
import { SYNERGY_DATABASE, POPULAR_ITEMS } from './SynergyAnalyzerMini';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../lib/utils';
import { analyzeSaveFile, fetchDailyStats, saveUserProgress, fetchUserProgress } from '../../../lib/api';
import { supabase } from '../../../lib/supabaseClient';

export function HeroSection({ onUploadSuccess, resetRef }) {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [uploadState, setUploadState] = useState('idle'); // idle | uploading | success | error
    const [errorMessage, setErrorMessage] = useState('');
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [dailyCount, setDailyCount] = useState(null);
    const [authUser, setAuthUser] = useState(null);
    const [userProgress, setUserProgress] = useState(null);
    const [forceUpload, setForceUpload] = useState(false);
    const [activeTab, setActiveTab] = useState('tracker'); // 'tracker' | 'synergy'

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

    // Load saved progress for logged-in users
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session?.user) return;
            setAuthUser(session.user);
            fetchUserProgress(session.user.id, session.access_token)
                .then(data => { if (data?.progress) setUserProgress(data.progress); })
                .catch(() => {});
        });
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
                // V3 uses meta.sha256, V2 uses metadata.fileHash
                serverHash: (result.meta?.sha256 || result.metadata?.sha256 || result.metadata?.fileHash || '').substring(0, 16),
                clientHash: result._clientHash?.substring(0, 16),
                deadGodPercent: result.progress?.deadGodPercent || result.metrics?.deadGodPercentage,
                achievementsCount: result.progress?.breakdown?.achievements?.count || result.secrets?.count,
                itemsCount: result.progress?.breakdown?.items?.count || result.items?.count,
                parseTimeMs: result.meta?.parseMs || result.metadata?.parseTimeMs
            });
            
            // Validate source is real data
            if (result.source !== 'real') {
                console.warn('[HeroSection] Received non-real source:', result.source);
                setUploadState('error');
                setErrorMessage(t('home.heroAnalysisFailed'));
                return;
            }

            // Transform V3 API response to UI format
            // V3 uses 'progress' and 'meta', V2 used 'metrics' and 'metadata'
            const characters = result.characters || {};
            const charArray = Object.values(characters);
            const completedCharCount = charArray.filter(c => c.percentage === 100).length;
            const vanillaChars = charArray.filter(c => !c.isTainted);
            const taintedChars = charArray.filter(c => c.isTainted);
            
            // Handle both V3 and V2 response formats
            const deadGodPercent = result.progress?.deadGodPercent ?? result.metrics?.deadGodPercentage ?? 0;
            const itemsCount = result.items?.collectedCount ?? result.items?.count ?? 0;
            const itemsTotal = result.items?.totalItems ?? result.items?.total ?? 733;
            const achievementsCount = result.progress?.breakdown?.achievements?.count ?? result.secrets?.count ?? 0;
            const achievementsTotal = result.progress?.breakdown?.achievements?.total ?? result.secrets?.total ?? 637;
            const endingsCount = result.endings?.count ?? 0;
            const endingsTotal = result.endings?.totalEndings ?? result.endings?.total ?? 17;
            
            const uiResult = {
                // Source tracking - CRITICAL
                source: result.source,
                isDemo: false,
                
                // Main percentage (Dead God progress)
                percentage: deadGodPercent,
                topPercentile: result.metrics?.topPercentile || null,
                
                // Characters
                charactersUnlocked: charArray.length,
                totalCharacters: 34,
                completedCharacters: completedCharCount,
                
                // Items
                itemsFound: itemsCount,
                totalItems: itemsTotal,
                
                // Completion marks
                completionMarks: result.totalMarks || 0,
                totalMarks: result.totalMarksExpected || 816,
                marksPercentage: result.progress?.breakdown?.marksHard?.percent ?? result.metrics?.marksPercentage ?? 0,
                
                // Achievements (secrets in V2)
                achievementsUnlocked: achievementsCount,
                totalAchievements: achievementsTotal,
                
                // Endings
                endingsSeen: endingsCount,
                totalEndings: endingsTotal,
                
                // Time estimate
                hoursRemaining: result.metrics?.estimatedHoursRemaining || null,
                
                // Next objective
                nextObjective: t('home.heroKeepPlaying'),
                
                // Most deaths (placeholder - not tracked in save file)
                mostDeaths: { count: '?', boss: t('home.heroNotAvailable') },
                
                // Tainted progress
                taintedCompletion: result.metrics?.taintedProgress?.percentage || 0,
                vanillaCompleted: vanillaChars.filter(c => c.percentage === 100).length,
                taintedCompleted: taintedChars.filter(c => c.percentage === 100).length,
                
                // File metadata
                slot: result.meta?.slot ?? result.metadata?.slot ?? 1,
                fileHash: (result.meta?.sha256 ?? result.metadata?.sha256 ?? result.metadata?.fileHash ?? '').substring(0, 16),
                sha256Full: result.meta?.sha256 ?? result.metadata?.sha256,
                uploadedAt: result.meta?.parsedAt ?? result.metadata?.parsedAt ?? new Date().toISOString(),
                
                // Full character data for detailed view
                characters: characters,
                
                // Sanity checks
                sanityChecks: result.sanity ?? result.sanityChecks,
                
                // Invariants passed
                invariantsPassed: result.sanity?.ok ?? result.sanityChecks?.invariantsPassed ?? true,
                warnings: result.meta?.warnings ?? result.sanity?.warnings ?? []
            };
            
            setUploadState('success');
            onUploadSuccess?.(uiResult);

            // Silently persist progress for authenticated users
            supabase.auth.getSession().then(({ data: { session } }) => {
                if (session?.user && session?.access_token) {
                    saveUserProgress(session.user.id, session.access_token, uiResult)
                        .catch(err => console.warn('[HeroSection] Progress save skipped:', err.message));
                }
            });
            
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
        <section className="relative w-full min-h-[85vh] flex items-center py-8 md:py-16 overflow-hidden bg-[#0d0908]">
            {/* Background — dungeon atmosphere */}
            <div className="absolute inset-0 pointer-events-none select-none">
                {/* Stone tile grid */}
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='48' height='48' viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0.5' y='0.5' width='47' height='47' fill='none' stroke='%23ffffff' stroke-width='0.5' stroke-opacity='0.04'/%3E%3C/svg%3E")`,
                    backgroundSize: '48px 48px',
                }} />
                {/* Blood glow from below */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[260px] bg-accent-blood rounded-full blur-3xl" style={{ opacity: 0.09 }} />
                {/* Top-left corner warmth */}
                <div className="absolute -top-16 -left-16 w-72 h-72 bg-accent-blood rounded-full blur-3xl" style={{ opacity: 0.06 }} />
                {/* Radial vignette */}
                <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 90% 85% at 50% 45%, transparent 35%, rgba(0,0,0,0.75) 100%)' }} />
                {/* Blood strip at top */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-accent-blood opacity-50" />

                {/* Floating item sprites — visible, atmospheric */}
                <motion.img src="/sprites/1_Passive Items/Brimstone.png" alt=""
                    className="absolute top-[22%] right-[13%] w-14 h-14 pixelated opacity-30 hidden lg:block"
                    animate={{ y: [0, -12, 0], rotate: [0, 5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.img src="/sprites/1_Passive Items/Sacred Heart.png" alt=""
                    className="absolute top-[48%] right-[6%] w-11 h-11 pixelated opacity-25 hidden lg:block"
                    animate={{ y: [0, -8, 0], rotate: [0, -5, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                />
                <motion.img src="/sprites/1_Passive Items/Godhead.png" alt=""
                    className="absolute top-[30%] left-[9%] w-12 h-12 pixelated opacity-20 hidden lg:block"
                    animate={{ y: [0, -8, 0], rotate: [0, 4, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                />
                <motion.img src="/sprites/1_Passive Items/Dead Cat.png" alt=""
                    className="absolute bottom-[28%] left-[14%] w-10 h-10 pixelated opacity-20 hidden xl:block"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
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
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading text-white leading-[0.95] tracking-tight mb-4"
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
                        className="text-lg md:text-xl lg:text-2xl font-handwriting text-white/65 max-w-xl mb-4"
                    >
                        {t('home.heroUploadDescription')}
                    </motion.p>

                    {/* Live Counter — always visible */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.25 }}
                        className="flex items-center gap-2 mb-8 px-4 py-2 bg-white/5 border border-white/10 rounded-full"
                    >
                        <FaBolt className="w-3 h-3 text-accent-gold" />
                        <span className="font-heading text-sm text-white/50">
                            {dailyCount === null ? (
                                <span className="inline-block h-4 w-20 bg-white/10 rounded animate-pulse align-middle" />
                            ) : dailyCount === 0 ? (
                                <span className="text-text-heading font-bold">{t('home.heroBeTheFirst', 'Be the first today')}</span>
                            ) : (
                                <>
                                    <motion.span
                                        key={dailyCount}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-white font-bold"
                                    >
                                        {dailyCount.toLocaleString()}
                                    </motion.span>
                                    {' '}{t('home.heroSavesAnalyzedToday')}
                                </>
                            )}
                        </span>
                    </motion.div>

                    {/* Tab switcher */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="flex w-full max-w-lg border border-white/10 mb-0"
                    >
                        <button
                            onClick={() => setActiveTab('tracker')}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-2.5 font-heading text-xs uppercase tracking-wider transition-all",
                                activeTab === 'tracker'
                                    ? "bg-accent-blood text-white"
                                    : "text-white/35 hover:text-white/60 hover:bg-white/5"
                            )}
                        >
                            <FaUpload className="w-3 h-3" />
                            {t('home.tabTracker', 'Track Progress')}
                        </button>
                        <div className="w-px bg-white/10" />
                        <button
                            onClick={() => setActiveTab('synergy')}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-2.5 font-heading text-xs uppercase tracking-wider transition-all",
                                activeTab === 'synergy'
                                    ? "bg-accent-gold text-black"
                                    : "text-white/35 hover:text-white/60 hover:bg-white/5"
                            )}
                        >
                            <FaBolt className="w-3 h-3" />
                            {t('home.tabSynergy', 'Synergy Check')}
                        </button>
                    </motion.div>

                    {/* Synergy tab */}
                    {activeTab === 'synergy' && (
                        <motion.div
                            key="synergy-tab"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="w-full max-w-lg"
                        >
                            <HeroSynergyTab t={t} navigate={navigate} />
                        </motion.div>
                    )}

                    {/* Tracker tab */}
                    {activeTab === 'tracker' && (
                    <AnimatePresence mode="wait">

                        {/* ── Personalized view: usuario logueado con progreso guardado ── */}
                        {uploadState === 'idle' && authUser && userProgress && !forceUpload && (
                            <motion.div
                                key="personalized"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ delay: 0.3 }}
                                className="w-full max-w-lg"
                            >
                                <div className="relative bg-[#1a0f0f] border-[3px] border-[#3d1a1a] p-8">
                                    {/* Corner ornaments */}
                                    <div className="absolute top-1 left-1 w-5 h-5 border-t-2 border-l-2 border-accent-blood/40" />
                                    <div className="absolute top-1 right-1 w-5 h-5 border-t-2 border-r-2 border-accent-blood/40" />
                                    <div className="absolute bottom-1 left-1 w-5 h-5 border-b-2 border-l-2 border-accent-blood/40" />
                                    <div className="absolute bottom-1 right-1 w-5 h-5 border-b-2 border-r-2 border-accent-blood/40" />

                                    <div className="text-center mb-6">
                                        <p className="text-white/40 font-handwriting text-sm mb-1">
                                            {t('home.heroWelcomeBack', 'Welcome back')}
                                        </p>
                                        <p className="font-heading text-2xl text-white">
                                            {authUser.email?.split('@')[0]}
                                        </p>
                                    </div>

                                    <div className="text-center mb-6">
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.4, type: 'spring' }}
                                            className="font-heading text-6xl text-accent-gold mb-1"
                                        >
                                            {Number(userProgress.dead_god_percent ?? 0).toFixed(1)}%
                                        </motion.div>
                                        <div className="font-handwriting text-white/50 text-sm mb-3">
                                            {t('home.heroDeadGodProgress', 'Dead God Progress')}
                                        </div>
                                        <div className="h-2 bg-white/10 overflow-hidden mx-2">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${userProgress.dead_god_percent ?? 0}%` }}
                                                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
                                                className="h-full bg-gradient-to-r from-accent-blood to-accent-gold"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <div className="bg-white/5 p-3 text-center">
                                            <div className="font-heading text-lg text-white">
                                                {userProgress.items?.collected ?? '—'}<span className="text-white/30 text-sm">/{userProgress.items?.total ?? '—'}</span>
                                            </div>
                                            <div className="text-xs text-white/40 font-handwriting mt-0.5">Items</div>
                                        </div>
                                        <div className="bg-white/5 p-3 text-center">
                                            <div className="font-heading text-lg text-white">
                                                {userProgress.achievements?.unlocked ?? '—'}<span className="text-white/30 text-sm">/{userProgress.achievements?.total ?? '—'}</span>
                                            </div>
                                            <div className="text-xs text-white/40 font-handwriting mt-0.5">Achievements</div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => navigate('/progress')}
                                            className="flex-1 py-3 bg-accent-blood text-white font-heading text-sm hover:bg-accent-blood/80 transition-colors"
                                        >
                                            {t('home.heroViewProgress', 'View Full Progress')} →
                                        </button>
                                        <button
                                            onClick={() => setForceUpload(true)}
                                            className="px-4 py-3 border border-white/15 text-white/35 font-heading text-xs hover:border-white/30 hover:text-white/60 transition-colors"
                                        >
                                            {t('home.heroReupload', 'Re-upload')}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ── Upload zone ── */}
                        {uploadState === 'idle' && !(authUser && userProgress && !forceUpload) && (
                            <motion.div
                                id="upload-zone"
                                key="upload"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ delay: 0.3 }}
                                className="w-full max-w-lg"
                            >
                                <div
                                    {...getRootProps()}
                                    className={cn(
                                        "relative p-8 md:p-10 cursor-pointer transition-all duration-300 border-[3px] group",
                                        isDragActive
                                            ? "border-accent-gold bg-[#1f1800] shadow-[0_0_32px_rgba(200,160,0,0.12)]"
                                            : "border-[#3d1a1a] bg-[#1a0f0f] hover:border-accent-blood hover:shadow-[0_0_24px_rgba(139,0,0,0.12)]"
                                    )}
                                >
                                    {/* Corner ornaments */}
                                    <div className={cn("absolute top-1 left-1 w-5 h-5 border-t-2 border-l-2 transition-colors duration-300", isDragActive ? "border-accent-gold" : "border-accent-blood/35 group-hover:border-accent-blood/60")} />
                                    <div className={cn("absolute top-1 right-1 w-5 h-5 border-t-2 border-r-2 transition-colors duration-300", isDragActive ? "border-accent-gold" : "border-accent-blood/35 group-hover:border-accent-blood/60")} />
                                    <div className={cn("absolute bottom-1 left-1 w-5 h-5 border-b-2 border-l-2 transition-colors duration-300", isDragActive ? "border-accent-gold" : "border-accent-blood/35 group-hover:border-accent-blood/60")} />
                                    <div className={cn("absolute bottom-1 right-1 w-5 h-5 border-b-2 border-r-2 transition-colors duration-300", isDragActive ? "border-accent-gold" : "border-accent-blood/35 group-hover:border-accent-blood/60")} />

                                    <input {...getInputProps()} />
                                    <div className="flex flex-col items-center gap-4">
                                        <div className={cn(
                                            "w-16 h-16 flex items-center justify-center transition-all duration-300",
                                            isDragActive ? "text-accent-gold scale-110" : "text-white/25 group-hover:text-accent-blood/60 group-hover:scale-105"
                                        )}>
                                            <FaUpload className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <p className="font-heading text-lg md:text-xl text-white mb-1">
                                                {isDragActive ? t('home.heroDropHere') : t('home.heroDragSaveFile')}
                                            </p>
                                            <p className="text-sm text-white/40 font-handwriting">
                                                {t('home.heroOrClickToSelect')}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Microcopy */}
                                <div className="mt-4 flex flex-col items-center gap-3">
                                    <div className="flex items-center gap-2 text-sm text-white/35">
                                        <span>🔒</span>
                                        <span className="font-sans">{t('home.heroPrivacyNote')}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setShowHelpModal(true); }}
                                            className="flex items-center gap-1 text-accent-blood/60 hover:text-accent-blood transition-colors"
                                        >
                                            <FaQuestionCircle className="w-3 h-3" />
                                            {t('home.heroWhereIsMySave')}
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); scrollToPreview(); }}
                                            className="text-white/30 hover:text-white/60 transition-colors"
                                        >
                                            {t('home.heroSeeExample')}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ── Uploading ── */}
                        {uploadState === 'uploading' && (
                            <motion.div
                                key="uploading"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="w-full max-w-lg bg-[#1a0f0f] border-[3px] border-[#3d1a1a] p-8"
                            >
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-12 h-12 border-4 border-accent-blood border-t-transparent rounded-full animate-spin" />
                                    <p className="font-heading text-xl text-white">{t('home.heroAnalyzingItems')}</p>
                                    <div className="w-full h-2 bg-white/10 overflow-hidden">
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

                        {/* ── Error ── */}
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
                                        <p className="text-sm text-white/50">
                                            {errorMessage || t('home.heroErrorDefault')}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-xs text-white/40 mb-4 pl-8">
                                    {t('home.heroErrorHint')} <code className="bg-white/10 px-1 rounded">rep_persistentgamedata1.dat</code> {t('home.heroErrorHintSuffix')}
                                </p>
                                <button
                                    onClick={resetUpload}
                                    className="px-4 py-2 bg-accent-blood text-white font-heading text-sm hover:bg-accent-blood/80 transition-colors"
                                >
                                    {t('home.heroTryAgain')}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    )} {/* end activeTab === 'tracker' */}

                    {/* Scroll hint - CRÍTICO para sugerir más contenido */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mt-12"
                    >
                        <button
                            onClick={scrollToPreview}
                            className="flex flex-col items-center gap-2 text-white/30 hover:text-accent-blood transition-colors group"
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

const RATING_STYLES = {
    S: 'bg-accent-gold text-black',
    A: 'bg-green-500 text-white',
    B: 'bg-blue-500 text-white',
    C: 'bg-orange-400 text-black',
    D: 'bg-accent-blood text-white',
};

function HeroSynergyTab({ t, navigate }) {
    const [selected, setSelected] = useState([]);
    const [result, setResult] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);

    const add = (item) => {
        if (selected.length >= 3 || selected.find(i => i.id === item.id)) return;
        setSelected(prev => [...prev, item]);
        setResult(null);
    };

    const remove = (id) => {
        setSelected(prev => prev.filter(i => i.id !== id));
        setResult(null);
    };

    const analyze = async () => {
        if (selected.length < 2) return;
        setAnalyzing(true);
        await new Promise(r => setTimeout(r, 600));
        const key = selected.map(i => i.id).sort().join('+');
        const rev = selected.map(i => i.id).sort().reverse().join('+');
        setResult(SYNERGY_DATABASE[key] || SYNERGY_DATABASE[rev] || { rating: 'B', score: 5, isGeneric: true });
        setAnalyzing(false);
    };

    const reset = () => { setSelected([]); setResult(null); };

    const visibleChips = POPULAR_ITEMS.slice(0, 8).filter(i => !selected.find(s => s.id === i.id));

    return (
        <div className="w-full space-y-0">
            <div className="bg-[#1a0f0f] border-[3px] border-[#3d1a1a] border-t-0 p-5">
                {/* Slot row */}
                <div className="flex items-center gap-1 flex-wrap min-h-[52px] mb-4">
                    {selected.length === 0 && (
                        <span className="text-white/30 font-handwriting text-sm">
                            {t('synergy.selectAtLeast2', 'Pick 2–3 items below to check their synergy')}
                        </span>
                    )}
                    {selected.map((item, idx) => (
                        <span key={item.id} className="flex items-center">
                            {idx > 0 && <span className="text-white/25 text-lg mx-1.5">+</span>}
                            <motion.button
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                onClick={() => remove(item.id)}
                                className="flex items-center gap-1.5 px-2 py-1.5 bg-white/5 border border-white/10 hover:border-accent-blood/50 group transition-colors"
                            >
                                <img src={item.sprite} alt={item.name} className="w-6 h-6 pixelated"
                                    onError={e => { e.target.src = '/sprites/placeholder.png'; }} />
                                <span className="font-heading text-xs text-white/65">{item.name}</span>
                                <FaTimes className="w-2.5 h-2.5 text-white/25 group-hover:text-accent-blood transition-colors ml-0.5" />
                            </motion.button>
                        </span>
                    ))}
                </div>

                {/* Popular chips */}
                {!result && visibleChips.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {visibleChips.map(item => (
                            <button
                                key={item.id}
                                onClick={() => add(item)}
                                disabled={selected.length >= 3}
                                className="flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-white/[0.07] hover:border-accent-gold/40 hover:bg-accent-gold/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <img src={item.sprite} alt={item.name} className="w-4 h-4 pixelated"
                                    onError={e => { e.target.src = '/sprites/placeholder.png'; }} />
                                <span className="text-[11px] font-heading text-white/55">{item.name}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Result */}
                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="pt-4 border-t border-white/10"
                        >
                            <div className="flex items-start gap-3">
                                <span className={cn('w-10 h-10 flex-shrink-0 flex items-center justify-center font-heading text-xl', RATING_STYLES[result.rating] || 'bg-white/10 text-white')}>
                                    {result.rating}
                                </span>
                                <p className="font-handwriting text-sm text-white/65 leading-relaxed pt-1">
                                    {result.effectKey
                                        ? t(`synergies.data.${result.effectKey}.effect`)
                                        : t('synergy.neutralSynergy', 'No documented interaction — could still work well together.')}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Actions */}
            {!result ? (
                <button
                    onClick={analyze}
                    disabled={selected.length < 2 || analyzing}
                    className="w-full py-3 bg-accent-gold text-black font-heading text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent-gold/90 transition-colors flex items-center justify-center gap-2"
                >
                    {analyzing
                        ? <><FaSpinner className="w-4 h-4 animate-spin" />{t('synergy.analyzing', 'Analyzing...')}</>
                        : <><FaBolt className="w-4 h-4" />{t('synergy.analyzeSynergy', 'Analyze Synergy')}</>
                    }
                </button>
            ) : (
                <div className="flex gap-px">
                    <button
                        onClick={() => navigate('/synergies', { state: { preloadedItems: selected } })}
                        className="flex-1 py-3 bg-accent-gold text-black font-heading text-sm hover:bg-accent-gold/90 transition-colors flex items-center justify-center gap-2"
                    >
                        {t('synergy.viewFullAnalysis', 'Full Analysis')} →
                    </button>
                    <button
                        onClick={reset}
                        className="px-5 py-3 bg-white/5 border-l border-white/10 text-white/40 font-heading text-xs hover:bg-white/10 hover:text-white/65 transition-colors"
                    >
                        {t('synergy.tryAnother', 'Reset')}
                    </button>
                </div>
            )}
        </div>
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
