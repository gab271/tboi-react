// HeroSection.jsx - Hero con foco único pero sugiere más contenido
import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaUpload, FaQuestionCircle, FaChevronDown, FaExclamationTriangle, FaBolt } from 'react-icons/fa';
import { useDropzone } from 'react-dropzone';
import { cn } from '../../../lib/utils';
import { analyzeSaveFile, fetchDailyStats } from '../../../lib/api';

export function HeroSection({ onUploadSuccess }) {
    const navigate = useNavigate();
    const [uploadState, setUploadState] = useState('idle'); // idle | uploading | success | error
    const [errorMessage, setErrorMessage] = useState('');
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [dailyCount, setDailyCount] = useState(null);

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
            setErrorMessage('El archivo no parece ser un save de Isaac. Busca "rep_persistentgamedata1.dat"');
            return;
        }

        setUploadState('uploading');
        setErrorMessage('');

        try {
            // REAL API CALL - no more mock data
            const result = await analyzeSaveFile(file);
            
            // Validate source is real data
            if (result.source !== 'real') {
                console.warn('[HeroSection] Received non-real source:', result.source);
                setUploadState('error');
                setErrorMessage('No se pudo analizar el archivo. Por favor intenta de nuevo.');
                return;
            }

            // Transform API response to UI format
            const uiResult = {
                // Source tracking - CRITICAL
                source: result.source,
                isDemo: false,
                
                // Main percentage (Dead God progress)
                percentage: result.metrics.deadGodPercentage,
                topPercentile: result.metrics.topPercentile,
                
                // Characters
                charactersUnlocked: result.parsed.completedCharacters,
                totalCharacters: result.parsed.totalCharacters,
                
                // Items
                itemsFound: result.parsed.itemsCollected,
                totalItems: result.parsed.totalItems,
                
                // Completion marks
                completionMarks: result.parsed.completionMarks,
                totalMarks: result.parsed.totalMarks,
                marksPercentage: result.metrics.marksPercentage,
                
                // Achievements
                achievementsUnlocked: result.parsed.achievementsUnlocked,
                totalAchievements: result.parsed.totalAchievements,
                
                // Endings (proxy: use characters with all marks as "endings seen")
                endingsSeen: result.parsed.completedCharacters,
                totalEndings: 17, // Approximate ending count
                
                // Blocker info
                blockerCharacter: result.parsed.blockerCharacter,
                blockerMarks: result.parsed.blockerMarks,
                
                // Time estimate
                hoursRemaining: result.metrics.estimatedHoursRemaining,
                
                // Next objective
                nextObjective: result.parsed.nextObjective,
                
                // Most deaths (placeholder - not tracked in save file)
                mostDeaths: { count: '?', boss: 'No disponible' },
                
                // Tainted progress
                taintedCompletion: result.metrics.taintedCompletion,
                vanillaCompleted: result.parsed.vanillaCompleted,
                taintedCompleted: result.parsed.taintedCompleted,
                
                // File metadata
                slot: result.parsed.slot,
                fileHash: result.parsed.fileHash,
                uploadedAt: result.parsed.uploadedAt,
                
                // Full character data for detailed view
                characters: result.parsed.characters
            };
            
            setUploadState('success');
            onUploadSuccess?.(uiResult);
            
        } catch (error) {
            console.error('[HeroSection] Upload error:', error);
            setUploadState('error');
            setErrorMessage(
                error.response?.error_message || 
                error.message || 
                'Error al analizar el archivo. Por favor intenta de nuevo.'
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
                            Dead God Tracker
                        </span>
                    </motion.div>

                    {/* H1 */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading text-text-heading leading-[0.95] tracking-tight mb-4"
                    >
                        ¿Cuánto te falta para
                        <br />
                        <span className="text-accent-gold">Dead God</span>?
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl lg:text-2xl font-handwriting text-text-ink/80 max-w-xl mb-4"
                    >
                        Sube tu save file → Ve tu % exacto → Descubre qué te falta
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
                                {' '}saves analizados hoy
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
                                                {isDragActive ? "Suelta aquí" : "Arrastra tu save file"}
                                            </p>
                                            <p className="text-sm text-text-dim font-handwriting">
                                                o haz click para seleccionar
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Microcopy */}
                                <div className="mt-4 flex flex-col items-center gap-3">
                                    <div className="flex items-center gap-2 text-sm text-text-dim">
                                        <span className="text-lg">🔒</span>
                                        <span className="font-sans">Tu archivo no se guarda · Sin registro · 100% privado</span>
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
                                            ¿Dónde está mi save?
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                scrollToPreview();
                                            }}
                                            className="text-text-dim hover:text-text-heading transition-colors"
                                        >
                                            Ver ejemplo →
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
                                    <p className="font-heading text-xl">Analizando 637 ítems...</p>
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
                                        <p className="font-heading text-accent-blood mb-1">Error al analizar</p>
                                        <p className="text-sm text-text-dim">
                                            {errorMessage || 'El archivo no pudo ser procesado.'}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-xs text-text-dim mb-4 pl-8">
                                    Busca <code className="bg-black/10 px-1 rounded">rep_persistentgamedata1.dat</code> en tu carpeta de Isaac
                                </p>
                                <button
                                    onClick={resetUpload}
                                    className="px-4 py-2 bg-black text-white font-heading text-sm hover:bg-accent-blood transition-colors"
                                >
                                    Intentar de nuevo
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
                                O explora builds, sinergias y más herramientas
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
                        ¿Dónde está mi save file?
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
                        Busca el archivo <strong>rep_persistentgamedata1.dat</strong>
                    </p>
                </div>

                <button
                    onClick={onClose}
                    className="mt-6 w-full py-3 bg-black text-white font-heading hover:bg-accent-blood transition-colors"
                >
                    Entendido
                </button>
                </motion.div>
            </div>
        </motion.div>
    );
}
