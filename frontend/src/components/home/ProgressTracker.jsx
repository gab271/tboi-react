// ProgressTracker.jsx - Dead God progress tracker feature
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUpload, FaCheckSquare, FaUsers, FaTrophy, FaChevronRight, FaQuestionCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

// Mock progress data
const MOCK_STATS = {
    usersTracking: 3247,
    averageProgress: 42,
};

export function ProgressTracker() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(null); // 'upload' | 'manual' | null
    const [uploadState, setUploadState] = useState('idle'); // 'idle' | 'uploading' | 'success' | 'error'
    const [progress, setProgress] = useState(null);

    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadState('uploading');
            // Simulate upload and analysis
            setTimeout(() => {
                setUploadState('success');
                setProgress({
                    percentage: 67,
                    charactersUnlocked: 31,
                    totalCharacters: 34,
                    itemsFound: 489,
                    totalItems: 637,
                    endingsSeen: 12,
                    totalEndings: 17,
                    nextObjective: 'Completa Greedier con Tainted Keeper - Desbloquea Golden Razor',
                });
            }, 2000);
        }
    };

    const resetTracker = () => {
        setActiveTab(null);
        setUploadState('idle');
        setProgress(null);
    };

    return (
        <section id="progress-tracker" className="relative w-full px-4 md:px-8 py-12">
            <div className="max-w-2xl mx-auto">
                {/* The Poster */}
                <motion.div
                    initial={{ opacity: 0, y: 30, rotate: 1 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative"
                >
                    {/* Tape effect */}
                    <div 
                        className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-8 z-20 pointer-events-none hidden sm:block"
                        style={{
                            background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.2) 100%)',
                            backdropFilter: 'blur(2px)',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            transform: 'rotate(-2deg)',
                        }}
                    />

                    {/* Main poster card */}
                    <div 
                        className="relative bg-[#fdfbf7] border-[3px] border-black shadow-[8px_8px_0px_#000] overflow-hidden"
                        style={{
                            clipPath: 'polygon(0% 0%, 5% 1%, 10% 0%, 15% 1%, 20% 0%, 25% 1%, 30% 0%, 35% 1%, 40% 0%, 45% 1%, 50% 0%, 55% 1%, 60% 0%, 65% 1%, 70% 0%, 75% 1%, 80% 0%, 85% 1%, 90% 0%, 95% 1%, 100% 0%, 100% 100%, 95% 99%, 90% 100%, 85% 99%, 80% 100%, 75% 99%, 70% 100%, 65% 99%, 60% 100%, 55% 99%, 50% 100%, 45% 99%, 40% 100%, 35% 99%, 30% 100%, 25% 99%, 20% 100%, 15% 99%, 10% 100%, 5% 99%, 0% 100%)'
                        }}
                    >
                        <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />
                        
                        <div className="p-6 sm:p-8 md:p-10">
                            {/* Header */}
                            <div className="text-center mb-6">
                                <motion.h2 
                                    className="text-4xl sm:text-5xl md:text-6xl font-heading text-black tracking-tight uppercase mb-2"
                                    animate={{ scale: [1, 1.02, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    MISSING
                                </motion.h2>
                                <div className="w-full h-0.5 bg-black/20 mb-4" />
                            </div>

                            {/* Character image placeholder */}
                            <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-6 bg-black/5 border-2 border-dashed border-black/20 flex items-center justify-center">
                                <img 
                                    src="/sprites/0_Characters/0_Vanilla/Blue Baby.png"
                                    alt="Your Progress"
                                    className="w-24 h-24 sm:w-32 sm:h-32 pixelated opacity-80"
                                />
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/scratches.png')] opacity-20 mix-blend-multiply" />
                            </div>

                            {/* Main text */}
                            <div className="text-center mb-6">
                                <h3 className="text-2xl sm:text-3xl font-heading text-black uppercase mb-2">
                                    YOUR PROGRESS
                                </h3>
                                <p className="font-handwriting text-xl text-black/70">
                                    &quot;¿Cuánto te falta para Dead God?&quot;
                                </p>
                            </div>

                            {/* Progress result (after upload) */}
                            <AnimatePresence mode="wait">
                                {progress && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="mb-6"
                                    >
                                        {/* Progress bar */}
                                        <div className="relative h-8 bg-black/10 border-2 border-black mb-4 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress.percentage}%` }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                                className="absolute inset-y-0 left-0 bg-accent-gold"
                                            />
                                            <span className="absolute inset-0 flex items-center justify-center font-heading text-lg text-black mix-blend-difference">
                                                {progress.percentage}% → Dead God
                                            </span>
                                        </div>

                                        {/* Stats grid */}
                                        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                                            <div className="p-3 bg-white/50 border border-black/10">
                                                <span className="text-text-dim font-handwriting">Personajes</span>
                                                <p className="font-heading text-lg">{progress.charactersUnlocked}/{progress.totalCharacters}</p>
                                            </div>
                                            <div className="p-3 bg-white/50 border border-black/10">
                                                <span className="text-text-dim font-handwriting">Ítems encontrados</span>
                                                <p className="font-heading text-lg">{progress.itemsFound}/{progress.totalItems}</p>
                                            </div>
                                            <div className="p-3 bg-white/50 border border-black/10">
                                                <span className="text-text-dim font-handwriting">Endings</span>
                                                <p className="font-heading text-lg">{progress.endingsSeen}/{progress.totalEndings}</p>
                                            </div>
                                            <div className="p-3 bg-accent-gold/10 border border-accent-gold/30">
                                                <span className="text-accent-gold font-handwriting">Siguiente objetivo</span>
                                                <p className="font-heading text-xs leading-tight">{progress.nextObjective}</p>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <button 
                                                onClick={() => navigate('/auth/register')}
                                                className="flex-1 h-12 flex items-center justify-center gap-2 bg-accent-blood text-white font-heading border-2 border-black shadow-[3px_3px_0px_#000] hover:shadow-[4px_4px_0px_#000] hover:-translate-y-0.5 transition-all"
                                            >
                                                💾 Guardar en mi perfil
                                            </button>
                                            <button 
                                                onClick={resetTracker}
                                                className="h-12 px-4 bg-white text-black font-heading border-2 border-black hover:bg-black hover:text-white transition-colors"
                                            >
                                                ↺ Otro análisis
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Upload state */}
                                {uploadState === 'uploading' && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-center py-8"
                                    >
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                            className="w-12 h-12 border-4 border-black border-t-accent-blood rounded-full mx-auto mb-4"
                                        />
                                        <p className="font-handwriting text-xl text-black">
                                            Analizando tu save...
                                        </p>
                                        <p className="text-sm text-text-dim mt-2">
                                            Contando tus lágrimas derramadas...
                                        </p>
                                    </motion.div>
                                )}

                                {/* Initial options */}
                                {!progress && uploadState === 'idle' && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        {/* Option buttons - always visible until upload starts */}
                                        <div className="space-y-3 mb-6">
                                            {/* Upload save option */}
                                            <label className="block">
                                                <input 
                                                    type="file"
                                                    accept=".dat"
                                                    onChange={handleFileUpload}
                                                    className="hidden"
                                                />
                                                <div className={cn(
                                                    "w-full p-4 bg-white border-2 border-black cursor-pointer transition-all",
                                                    "hover:bg-black hover:text-white hover:shadow-[4px_4px_0px_#a80000]",
                                                    "flex items-center gap-4"
                                                )}>
                                                    <div className="w-12 h-12 bg-black text-white flex items-center justify-center">
                                                        <FaUpload className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex-1 text-left">
                                                        <span className="font-heading text-lg block">Subir mi archivo de save</span>
                                                        <span className="text-sm opacity-70 font-handwriting">Análisis automático en 10 seg</span>
                                                    </div>
                                                    <FaChevronRight className="w-4 h-4 opacity-50" />
                                                </div>
                                            </label>

                                            <div className="flex items-center gap-4 text-text-dim">
                                                <div className="flex-1 h-px bg-black/20" />
                                                <span className="font-handwriting">o</span>
                                                <div className="flex-1 h-px bg-black/20" />
                                            </div>

                                            {/* Manual tracking option */}
                                            <button 
                                                onClick={() => navigate('/progress')}
                                                className={cn(
                                                    "w-full p-4 bg-white border-2 border-black cursor-pointer transition-all",
                                                    "hover:bg-black hover:text-white hover:shadow-[4px_4px_0px_#d4af37]",
                                                    "flex items-center gap-4"
                                                )}
                                            >
                                                <div className="w-12 h-12 bg-accent-gold text-white flex items-center justify-center">
                                                    <FaCheckSquare className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <span className="font-heading text-lg block">Trackear manualmente</span>
                                                    <span className="text-sm opacity-70 font-handwriting">Marca tus completion marks</span>
                                                </div>
                                                <FaChevronRight className="w-4 h-4 opacity-50" />
                                            </button>
                                        </div>

                                        {/* Help link */}
                                        <div className="text-center">
                                            <button className="inline-flex items-center gap-1 text-sm text-text-dim hover:text-accent-blood transition-colors font-handwriting">
                                                <FaQuestionCircle className="w-3 h-3" />
                                                ¿Dónde está mi archivo de save?
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Social proof */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center justify-center gap-2 mt-4 text-text-dim"
                    >
                        <FaUsers className="w-4 h-4" />
                        <span className="font-handwriting">
                            {MOCK_STATS.usersTracking.toLocaleString()} jugadores ya trackeando su Dead God
                        </span>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
