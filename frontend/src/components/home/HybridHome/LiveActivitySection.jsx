// LiveActivitySection.jsx - Prueba social con actividad en tiempo real
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FaFire, FaBolt, FaTrophy, FaChevronRight, FaStar, FaComment } from 'react-icons/fa';
import { cn } from '../../../lib/utils';
import { fetchActivityFeed, fetchLiveActivity } from '../../../lib/api';
import { fetchBuildsFeed } from '../../../features/builds/api';
import { charactersData } from '../../../features/characters/data/charactersData';

// Map a character_slug from build_posts to a sprite from charactersData
const charSpriteCache = new Map(charactersData.map(c => [c.id, c.image]));

function getCharSprite(slug) {
    if (!slug) return null;
    // Direct match
    if (charSpriteCache.has(slug)) return charSpriteCache.get(slug);
    // Fuzzy: find by normalized name
    const norm = slug.toLowerCase().replace(/[^a-z]/g, '');
    for (const [id, img] of charSpriteCache) {
        if (id.replace(/[^a-z]/g, '') === norm) return img;
    }
    return null;
}

function timeAgo(timestamp) {
    const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000 / 60);
    if (diff < 1) return 'just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
}

function feedItemText(item) {
    switch (item.type) {
        case 'build_created':    return { action: 'shared a build', target: item.metadata?.title || '' };
        case 'dead_god_reached': return { action: 'achieved', target: 'Dead God 🏆' };
        case 'achievement_unlocked': return { action: 'unlocked', target: item.metadata?.name || 'an achievement' };
        case 'save_analyzed':    return { action: 'analyzed their save file', target: '' };
        default:                 return { action: 'was active', target: '' };
    }
}

export function LiveActivitySection() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
    const [feed, setFeed] = useState(null);
    const [liveStats, setLiveStats] = useState(null);

    // Real top builds from DB
    const { data: topBuildsData, isLoading: buildsLoading } = useQuery({
        queryKey: ['top-builds-home'],
        queryFn: () => fetchBuildsFeed({ sort: 'top', limit: 3 }),
        staleTime: 5 * 60_000,
    });

    // Fetch real feed and stats on mount, refresh stats every 30s
    useEffect(() => {
        fetchActivityFeed(8)
            .then(d => setFeed(d.ok ? d.feed : []))
            .catch(() => setFeed([]));

        const loadStats = () =>
            fetchLiveActivity()
                .then(d => setLiveStats(d.ok ? d.stats : null))
                .catch(() => {});

        loadStats();
        const statsInterval = setInterval(loadStats, 30000);
        return () => clearInterval(statsInterval);
    }, []);

    // Rotate ticker only when we have real items
    useEffect(() => {
        if (!feed?.length) return;
        const interval = setInterval(() => {
            setCurrentActivityIndex(prev => (prev + 1) % feed.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [feed]);

    return (
        <section className="relative w-full px-4 md:px-8 py-16 bg-black/5">
            <div className="max-w-6xl mx-auto">
                {/* Section header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-10"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-blood/10 border border-accent-blood/30 text-accent-blood font-heading text-sm uppercase tracking-wider mb-4">
                        <span className="w-2 h-2 bg-accent-blood rounded-full animate-pulse" />
                        {t('home.activeCommunity')}
                    </div>
                    <h2 className="font-heading text-2xl md:text-3xl text-text-heading uppercase tracking-wider">
                        {t('home.whatsHappening')}
                    </h2>
                </motion.div>

                {/* Live Ticker */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-10 bg-black text-white p-4 border-[3px] border-black shadow-[4px_4px_0px_rgba(0,0,0,0.3)]"
                >
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1 bg-accent-blood text-white font-heading text-xs uppercase shrink-0">
                            <motion.span
                                animate={{ opacity: [1, 0.5, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                            >
                                <FaBolt className="w-3 h-3" />
                            </motion.span>
                            {t('home.live')}
                        </div>
                        
                        <div className="flex-1 overflow-hidden">
                            {feed === null ? (
                                // Loading skeleton
                                <div className="flex items-center gap-3">
                                    <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
                                    <div className="h-4 w-40 bg-white/10 rounded animate-pulse" />
                                </div>
                            ) : feed.length === 0 ? (
                                // Empty — no fake data, neutral message
                                <span className="font-handwriting text-sm text-white/60">
                                    {t('liveActivity.beTheFirst', 'Be the first to analyze your save file today')}
                                </span>
                            ) : (
                                // Real feed item
                                <motion.div
                                    key={currentActivityIndex}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-2 font-handwriting text-sm md:text-base"
                                >
                                    <span className="text-accent-gold font-heading">
                                        {feed[currentActivityIndex].user}
                                    </span>
                                    <span className="text-white/70">
                                        {feedItemText(feed[currentActivityIndex]).action}
                                    </span>
                                    {feedItemText(feed[currentActivityIndex]).target && (
                                        <span className="text-white">
                                            {feedItemText(feed[currentActivityIndex]).target}
                                        </span>
                                    )}
                                    <span className="text-white/50 text-xs ml-auto shrink-0">
                                        · {timeAgo(feed[currentActivityIndex].timestamp)}
                                    </span>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Two column layout */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Top Builds - 2 columns */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-heading text-lg text-text-heading uppercase flex items-center gap-2">
                                <motion.span
                                    animate={{ 
                                        scale: [1, 1.2, 1],
                                        rotate: [0, -5, 5, 0]
                                    }}
                                    transition={{ 
                                        duration: 2,
                                        repeat: Infinity,
                                        repeatDelay: 1
                                    }}
                                >
                                    <FaFire className="text-accent-blood" />
                                </motion.span>
                                {t('home.topWeekBuilds')}
                            </h3>
                            <button 
                                onClick={() => navigate('/builds')}
                                className="text-sm text-accent-blood hover:underline font-heading flex items-center gap-1"
                            >
                                {t('home.viewAllBuilds')} <FaChevronRight className="w-3 h-3" />
                            </button>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                            {buildsLoading ? (
                                // Skeleton cards
                                Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="bg-bg-paper border-[3px] border-black shadow-[4px_4px_0px_#000] p-3 space-y-3 animate-pulse">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-black/10 rounded" />
                                            <div className="flex-1 space-y-1.5">
                                                <div className="h-3 bg-black/10 rounded w-3/4" />
                                                <div className="h-2 bg-black/10 rounded w-1/2" />
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="w-8 h-8 bg-black/10 rounded" />
                                            <div className="w-8 h-8 bg-black/10 rounded" />
                                        </div>
                                    </div>
                                ))
                            ) : (topBuildsData || []).length === 0 ? (
                                <div className="col-span-3 text-center py-8 text-text-dim font-handwriting text-lg opacity-60">
                                    No builds yet — be the first to share one!
                                </div>
                            ) : (
                                (topBuildsData || []).map((build, index) => (
                                    <BuildCard key={build.id} build={build} index={index} />
                                ))
                            )}
                        </div>
                    </div>

                    {/* Today's Stats */}
                    <div>
                        <h3 className="font-heading text-lg text-text-heading uppercase flex items-center gap-2 mb-4">
                            <motion.span
                                animate={{ 
                                    y: [0, -3, 0],
                                }}
                                transition={{ 
                                    duration: 1.5,
                                    repeat: Infinity,
                                    repeatDelay: 2
                                }}
                            >
                                <FaTrophy className="text-accent-gold" />
                            </motion.span>
                            {t('home.todayStats')}
                        </h3>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-bg-paper border-[3px] border-black shadow-[4px_4px_0px_#000] p-5"
                        >
                            {liveStats === null ? (
                                // Loading skeletons
                                <div className="space-y-4">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3">
                                            <div className="w-8 h-8 bg-black/10 rounded animate-pulse" />
                                            <div className="flex-1 space-y-1">
                                                <div className="h-5 w-16 bg-black/10 rounded animate-pulse" />
                                                <div className="h-3 w-28 bg-black/10 rounded animate-pulse" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <StatRow
                                        icon="📁"
                                        value={liveStats.savesToday ?? 0}
                                        label={t('liveActivity.savesAnalyzedToday', 'Saves analyzed today')}
                                        highlight
                                    />
                                    <StatRow
                                        icon="⚡"
                                        value={liveStats.synergiesChecked ?? 0}
                                        label={t('liveActivity.synergiesChecked', 'Synergies checked today')}
                                    />
                                    <StatRow
                                        icon="🏗️"
                                        value={liveStats.buildsToday ?? 0}
                                        label={t('liveActivity.buildsCreated', 'Builds created today')}
                                    />
                                    <StatRow
                                        icon="👥"
                                        value={liveStats.usersActive ?? 0}
                                        label={t('liveActivity.usersActive', 'Active users (15 min)')}
                                    />
                                </div>
                            )}

                            <div className="mt-6 pt-4 border-t-2 border-dashed border-black/10">
                                <p className="text-xs text-text-dim font-handwriting text-center">
                                    {liveStats
                                        ? t('liveActivity.updatedMinutesAgo', { count: 0 })
                                        : t('liveActivity.loading', 'Loading...')}
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function BuildCard({ build, index }) {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const charSprite = getCharSprite(build.character_slug);
    const authorName = build.author?.username || 'Anonymous';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4, boxShadow: '6px 6px 0px #000' }}
            onClick={() => navigate(`/builds/${build.id}`)}
            className="bg-bg-paper border-[3px] border-black shadow-[4px_4px_0px_#000] cursor-pointer transition-all group"
        >
            {/* Header with character */}
            <div className="flex items-center gap-3 p-3 border-b-2 border-black/10 group-hover:border-accent-gold/30 transition-colors">
                {charSprite ? (
                    <img
                        src={charSprite}
                        alt={build.character_slug}
                        className="w-10 h-10 object-contain flex-shrink-0"
                        style={{ imageRendering: 'pixelated' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                ) : (
                    <div className="w-10 h-10 bg-black/10 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                    <h4 className="font-heading text-sm text-text-heading truncate group-hover:text-accent-blood transition-colors">
                        {build.title}
                    </h4>
                    <p className="text-xs text-text-dim font-handwriting">
                        {t('liveActivity.byAuthor', 'by')} @{authorName}
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between px-3 py-2 text-xs text-text-dim">
                <span className="flex items-center gap-1 group-hover:text-accent-gold transition-colors">
                    <FaStar className="text-accent-gold" />
                    {build.score ?? 0}
                </span>
                <span className="flex items-center gap-1">
                    <FaComment />
                    {build.comments_count ?? 0}
                </span>
            </div>
        </motion.div>
    );
}

function StatRow({ icon, value, label, highlight }) {
    return (
        <div className={cn(
            "flex items-center gap-3 p-3 -mx-2 rounded transition-colors",
            highlight ? "bg-accent-gold/10" : "hover:bg-black/5"
        )}>
            <span className="text-xl">{icon}</span>
            <div className="flex-1">
                <p className={cn(
                    "font-heading text-lg",
                    highlight ? "text-accent-gold" : "text-text-heading"
                )}>
                    {value}
                </p>
                <p className="text-xs text-text-dim font-handwriting">{label}</p>
            </div>
        </div>
    );
}
