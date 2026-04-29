import { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaScroll, FaSkull, FaFlask, FaHourglassHalf, FaUpload } from 'react-icons/fa';
import { AuthContext } from '../../contexts/AuthContext';
import { fetchUserProgress } from '../../lib/api';
import { supabase } from '../../lib/supabaseClient';

// ── helpers ───────────────────────────────────────────────────────────────────

function pct(value, total) {
    if (!total) return 0;
    return Math.round((value / total) * 100);
}

/**
 * ProgressBar — track always visible, fill animated on mount.
 * MEJORA 2: track bg-[#3a2e2e] clearly distinguishable from card bg.
 */
function ProgressBar({ value, max, color = 'bg-amber-500' }) {
    const percent = pct(value, max);
    return (
        <div className="w-full bg-[#3a2e2e] rounded-sm h-[6px] overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]">
            <motion.div
                className={`h-full rounded-sm ${color}`}
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                style={{ boxShadow: '0 0 6px currentColor' }}
            />
        </div>
    );
}

/**
 * StatCard
 * MEJORA 1: card bg slightly warmer + colored top border accent
 * MEJORA 3: big bold current value, small muted total
 * MEJORA 4: VT323 pixel font for labels — legible, on-brand
 */
function StatCard({ icon: Icon, label, value, max, accentColor, barColor, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4, ease: 'easeOut' }}
            className="relative flex flex-col gap-3 p-5 rounded-xl overflow-hidden"
            style={{
                background: 'linear-gradient(160deg, #221c1c 0%, #1a1515 100%)',
                border: '1px solid rgba(255,255,255,0.07)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
            }}
        >
            {/* Mejora 1: colored top-border stripe */}
            <div
                className={`absolute top-0 left-0 right-0 h-[3px] ${barColor}`}
                style={{ opacity: 0.85 }}
            />

            {/* Label row — MEJORA 4: font-pixel (VT323) */}
            <div className="flex items-center gap-2 mt-1">
                <Icon className="shrink-0 text-[15px]" style={{ color: accentColor }} />
                <span
                    className="font-pixel text-[13px] tracking-[0.12em] uppercase"
                    style={{ color: 'rgba(200,185,175,0.75)' }}
                >
                    {label}
                </span>
            </div>

            {/* Number — MEJORA 3: large bold current, small muted total */}
            <p className="leading-none">
                <span
                    className="font-heading text-[2rem] font-bold"
                    style={{ color: accentColor }}
                >
                    {value}
                </span>
                <span className="font-pixel text-[11px] text-gray-600 ml-2">
                    / {max}
                </span>
            </p>

            <ProgressBar value={value} max={max} color={barColor} />

            <p className="font-pixel text-[11px] text-right" style={{ color: 'rgba(160,140,130,0.5)' }}>
                {pct(value, max)}%
            </p>
        </motion.div>
    );
}

// ── main component ────────────────────────────────────────────────────────────

export default function MyProgress() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const { data: progress, isLoading, isError, error } = useQuery({
        queryKey: ['userProgress', user?.id],
        queryFn: async () => {
            const { data: { session: s } } = await supabase.auth.getSession();
            if (!s) throw new Error('Not authenticated');
            return fetchUserProgress(s.user.id, s.access_token);
        },
        enabled: !!user,
        staleTime: 1000 * 60 * 5,
        retry: 1,
    });

    // ── Loading ──
    if (isLoading) {
        return (
            <div className="min-h-screen bg-bg-floor flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                    className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    // ── No data yet ──
    if (!progress || isError) {
        return (
            <div className="min-h-screen bg-bg-floor flex flex-col items-center justify-center gap-6 text-center px-4">
                <FaScroll className="text-5xl text-amber-500/40" />
                <h2 className="font-heading text-amber-400 text-lg">NO PROGRESS SAVED YET</h2>
                <p className="font-pixel text-[13px] text-gray-500 max-w-sm leading-relaxed">
                    Upload your save file on the home page<br />to analyze and track your progress.
                </p>
                {isError && <p className="text-red-400 text-xs font-pixel">{error?.message}</p>}
                <CTAButton onClick={() => navigate('/')} />
            </div>
        );
    }

    const { dead_god_percent, items, achievements, characters, summary, updated_at } = progress;
    const charEntries = Object.entries(characters || {});
    const vanillaChars = charEntries.filter(([, c]) => !c.isTainted);
    const taintedChars = charEntries.filter(([, c]) => c.isTainted);

    return (
        <div className="min-h-screen bg-bg-floor text-gray-200 relative overflow-x-hidden">
            {/* Radial vignette */}
            <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.55)_100%)] z-0" />

            <div className="relative z-10 container mx-auto px-4 py-16 max-w-5xl">

                {/* ── Title ── */}
                <motion.div
                    initial={{ opacity: 0, y: -24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-12 flex flex-col items-center gap-2"
                >
                    <h1 className="font-heading text-5xl md:text-6xl tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-amber-400 to-amber-700 drop-shadow-[0_0_18px_rgba(234,179,8,0.35)] pb-1">
                        MY PROGRESS
                    </h1>
                    {updated_at && (
                        <p className="font-pixel text-[11px] text-gray-600 tracking-wider">
                            LAST SYNC — {new Date(updated_at).toLocaleDateString(undefined, { dateStyle: 'medium' }).toUpperCase()}
                        </p>
                    )}
                </motion.div>

                {/* ── Dead God Meter ── */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.08, duration: 0.45 }}
                    className="mb-4 rounded-2xl p-8 flex flex-col items-center gap-5"
                    style={{
                        background: 'linear-gradient(170deg, #231c1c 0%, #160f0f 100%)',
                        border: '1px solid rgba(198,64,64,0.25)',
                        boxShadow: '0 0 40px rgba(198,64,64,0.06), 0 8px 32px rgba(0,0,0,0.5)',
                    }}
                >
                    <p className="font-pixel text-[11px] tracking-[0.25em] text-amber-600/60 uppercase">
                        Dead God Progress
                    </p>

                    {/* MEJORA 3: big bold number */}
                    <p className="font-heading leading-none drop-shadow-[0_0_22px_rgba(251,191,36,0.45)]"
                        style={{ fontSize: 'clamp(4rem, 12vw, 7rem)', color: '#f5c842' }}
                    >
                        {Number(dead_god_percent).toFixed(1)}
                        <span className="text-3xl text-amber-700 ml-1">%</span>
                    </p>

                    <div className="w-full max-w-lg">
                        {/* Mejora 2: visible track for the Dead God bar */}
                        <div className="w-full bg-[#3a2010] rounded-sm h-3 overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.7)]">
                            <motion.div
                                className="h-full rounded-sm bg-gradient-to-r from-amber-700 via-yellow-500 to-amber-300"
                                initial={{ width: 0 }}
                                animate={{ width: `${dead_god_percent}%` }}
                                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                                style={{ boxShadow: '0 0 10px rgba(251,191,36,0.5)' }}
                            />
                        </div>
                    </div>

                    {/* MEJORA 5: CTA below the big percentage */}
                    <CTAButton onClick={() => navigate('/')} />
                </motion.div>

                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
                    <StatCard delay={0.15} icon={FaFlask}       label="Items Collected"      value={items?.collected ?? 0}          max={items?.total ?? 733}          accentColor="#60a5fa" barColor="bg-blue-500" />
                    <StatCard delay={0.20} icon={FaStar}         label="Achievements"          value={achievements?.unlocked ?? 0}    max={achievements?.total ?? 637}   accentColor="#facc15" barColor="bg-yellow-500" />
                    <StatCard delay={0.25} icon={FaSkull}        label="Completion Marks"      value={summary?.completionMarks ?? 0}  max={summary?.totalMarks ?? 816}   accentColor="#f87171" barColor="bg-red-500" />
                    <StatCard delay={0.30} icon={FaScroll}       label="Endings Seen"          value={summary?.endings?.seen ?? 0}    max={summary?.endings?.total ?? 17} accentColor="#c084fc" barColor="bg-purple-500" />
                    <StatCard delay={0.35} icon={FaHourglassHalf} label="Vanilla Characters"   value={summary?.vanillaCompleted ?? 0} max={17}                           accentColor="#4ade80" barColor="bg-green-500" />
                    <StatCard delay={0.40} icon={FaHourglassHalf} label="Tainted Characters"   value={summary?.taintedCompleted ?? 0} max={17}                           accentColor="#f472b6" barColor="bg-pink-500" />
                </div>

                {/* ── Characters ── */}
                {charEntries.length > 0 && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
                        className="mb-10"
                    >
                        <h2 className="font-heading text-base text-amber-400/80 mb-5 tracking-widest">
                            CHARACTERS
                        </h2>

                        {[['VANILLA', vanillaChars], ['TAINTED', taintedChars]].map(([group, chars]) =>
                            chars.length > 0 && (
                                <div key={group} className="mb-6">
                                    <h3 className="font-pixel text-[11px] tracking-[0.2em] text-gray-600 mb-3 uppercase">
                                        {group}
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {chars.map(([name, char]) => {
                                            const done = char.percentage === 100;
                                            return (
                                                <div
                                                    key={name}
                                                    className="flex items-center gap-4 px-4 py-3 rounded-lg"
                                                    style={{
                                                        background: done
                                                            ? 'linear-gradient(90deg, rgba(52,211,153,0.07) 0%, rgba(26,21,21,0) 100%)'
                                                            : 'rgba(26,21,21,0.7)',
                                                        border: `1px solid ${done ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.05)'}`,
                                                    }}
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        {/* MEJORA 4: font-pixel for char name */}
                                                        <p className="font-pixel text-[12px] text-gray-300 truncate mb-2">{name}</p>
                                                        <ProgressBar
                                                            value={char.percentage}
                                                            max={100}
                                                            color={done ? 'bg-emerald-400' : 'bg-amber-600'}
                                                        />
                                                    </div>
                                                    <span
                                                        className="font-heading text-sm shrink-0"
                                                        style={{ color: done ? '#34d399' : '#f5a623' }}
                                                    >
                                                        {char.percentage}%
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )
                        )}
                    </motion.section>
                )}

                {/* ── Hours estimate ── */}
                {summary?.hoursRemaining != null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-center font-pixel text-[12px] text-gray-700 tracking-wider"
                    >
                        EST. HOURS REMAINING:{' '}
                        <span className="text-amber-500">{summary.hoursRemaining}H</span>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

// ── CTA Button (MEJORA 5) ────────────────────────────────────────────────────

function CTAButton({ onClick }) {
    return (
        <motion.button
            onClick={onClick}
            whileHover={{ y: -2 }}
            whileTap={{ y: 2, boxShadow: '0 1px 0 #7a1a1a' }}
            className="flex items-center gap-3 font-heading text-[11px] tracking-wider text-white px-6 py-3 rounded-lg"
            style={{
                background: 'linear-gradient(180deg, #c64040 0%, #a33535 100%)',
                boxShadow: '0 4px 0 #7a1a1a, 0 6px 20px rgba(198,64,64,0.35)',
                border: '1px solid rgba(255,120,120,0.2)',
                letterSpacing: '0.1em',
            }}
        >
            <FaUpload className="text-[13px] opacity-80" />
            SYNC PROGRESS
        </motion.button>
    );
}
