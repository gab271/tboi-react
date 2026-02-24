// ActivityFeed.jsx - Live community activity section
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaFire, FaBolt, FaTrophy, FaStar, FaComment, FaChevronRight } from 'react-icons/fa';
import { cn } from '../../lib/utils';

// Mock data - in production this would come from an API
const TOP_BUILDS = [
    {
        id: 1,
        title: 'Brimstone Death Machine',
        author: { username: 'EdmundFan', avatar: null },
        character: { name: 'Tainted Lost', sprite: '/sprites/0_Characters/1_Tainted/Tainted Lost.png' },
        bossBeat: 'Delirium',
        keyItems: [
            { name: 'Brimstone', sprite: '/sprites/1_Passive Items/Brimstone.png' },
            { name: 'Polyphemus', sprite: '/sprites/1_Passive Items/Polyphemus.png' },
            { name: 'Tammy\'s Head', sprite: '/sprites/2_Active Items/Tammys Head.png' },
        ],
        votes: 234,
        comments: 18,
        createdAt: '2h ago',
    },
    {
        id: 2,
        title: 'Echo Chamber Infinite',
        author: { username: 'IsaacPro', avatar: null },
        character: { name: 'Bethany', sprite: '/sprites/0_Characters/0_Vanilla/Bethany.png' },
        bossBeat: 'Mother',
        keyItems: [
            { name: 'Book of Virtues', sprite: '/sprites/2_Active Items/Book Of Virtues.png' },
            { name: 'Echo Chamber', sprite: '/sprites/1_Passive Items/Echo Chamber.png' },
        ],
        votes: 189,
        comments: 24,
        createdAt: '5h ago',
    },
    {
        id: 3,
        title: 'T. Keeper Greed Destroyer',
        author: { username: 'GoldenPenny', avatar: null },
        character: { name: 'Tainted Keeper', sprite: '/sprites/0_Characters/1_Tainted/Tainted Keeper.png' },
        bossBeat: 'Ultra Greed',
        keyItems: [
            { name: 'Pound of Flesh', sprite: '/sprites/1_Passive Items/Pound Of Flesh.png' },
            { name: 'Money = Power', sprite: '/sprites/1_Passive Items/Money Equals Power.png' },
        ],
        votes: 156,
        comments: 12,
        createdAt: '8h ago',
    },
];

const RECENT_BUILDS = [
    {
        id: 4,
        title: 'First Dead God attempt',
        author: { username: 'NewPlayer123', avatar: null },
        character: { name: 'Isaac', sprite: '/sprites/0_Characters/0_Vanilla/Isaac.png' },
        keyItems: [
            { name: 'Sacred Heart', sprite: '/sprites/1_Passive Items/Sacred Heart.png' },
            { name: 'Godhead', sprite: '/sprites/1_Passive Items/Godhead.png' },
        ],
        createdAt: '3 min ago',
    },
    {
        id: 5,
        title: 'Lucky Angel Room run',
        author: { username: 'RNGBlessed', avatar: null },
        character: { name: 'Magdalene', sprite: '/sprites/0_Characters/0_Vanilla/Magdalene.png' },
        keyItems: [
            { name: 'Holy Mantle', sprite: '/sprites/1_Passive Items/Holy Mantle.png' },
        ],
        createdAt: '12 min ago',
    },
    {
        id: 6,
        title: 'Chaos Build Showcase',
        author: { username: 'RandomFun', avatar: null },
        character: { name: 'Eden', sprite: '/sprites/0_Characters/0_Vanilla/Eden.png' },
        keyItems: [
            { name: 'Chaos', sprite: '/sprites/1_Passive Items/Chaos.png' },
        ],
        createdAt: '28 min ago',
    },
];

const RECENT_ACHIEVEMENTS = [
    { id: 1, username: 'NorthernLion', achievement: 'Dead God', time: '12 min ago', icon: '🏆' },
    { id: 2, username: 'SinVicta', achievement: 'Tainted Jacob unlocked', time: '23 min ago', icon: '⭐' },
    { id: 3, username: 'Hutts', achievement: 'The Beast defeated', time: '45 min ago', icon: '👹' },
    { id: 4, username: 'LavolpeTV', achievement: 'Guppy transformation', time: '1h ago', icon: '🐱' },
    { id: 5, username: 'Cobaltstreak', achievement: '500 wins', time: '2h ago', icon: '🎯' },
];

function BuildCard({ build, variant = 'full', t }) {
    const navigate = useNavigate();
    const isCompact = variant === 'compact';

    return (
        <motion.div
            whileHover={{ y: -2, boxShadow: '6px 6px 0px #000' }}
            className={cn(
                "bg-bg-paper border-2 border-black shadow-[4px_4px_0px_#000] cursor-pointer transition-all",
                isCompact ? "p-3" : "p-4"
            )}
            onClick={() => navigate(`/builds/${build.id}`)}
        >
            {/* Header */}
            <div className="flex items-start gap-3 mb-3">
                <img 
                    src={build.character.sprite}
                    alt={build.character.name}
                    className={cn("pixelated", isCompact ? "w-10 h-10" : "w-12 h-12")}
                    onError={(e) => { e.target.src = '/sprites/placeholder.png'; }}
                />
                <div className="flex-1 min-w-0">
                    <h4 className={cn(
                        "font-heading text-text-heading truncate",
                        isCompact ? "text-sm" : "text-base"
                    )}>
                        {build.title}
                    </h4>
                    <p className="text-xs text-text-dim font-handwriting">
                        {t('home.byAuthor')} @{build.author.username}
                    </p>
                </div>
            </div>

            {/* Key items */}
            <div className="flex items-center gap-1 mb-3">
                {build.keyItems.slice(0, 3).map((item, idx) => (
                    <img
                        key={idx}
                        src={item.sprite}
                        alt={item.name}
                        title={item.name}
                        className="w-8 h-8 pixelated bg-black/5 border border-black/10 p-0.5"
                        onError={(e) => { e.target.src = '/sprites/placeholder.png'; }}
                    />
                ))}
                {build.keyItems.length > 3 && (
                    <span className="text-xs text-text-dim font-handwriting ml-1">
                        +{build.keyItems.length - 3}
                    </span>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-text-dim">
                <div className="flex items-center gap-3">
                    {build.votes !== undefined && (
                        <span className="flex items-center gap-1">
                            <FaStar className="w-3 h-3 text-accent-gold" />
                            {build.votes}
                        </span>
                    )}
                    {build.comments !== undefined && (
                        <span className="flex items-center gap-1">
                            <FaComment className="w-3 h-3" />
                            {build.comments}
                        </span>
                    )}
                </div>
                <span className="font-handwriting">{build.createdAt}</span>
            </div>
        </motion.div>
    );
}

function AchievementItem({ item }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 py-2 border-b border-black/10 last:border-b-0"
        >
            <span className="text-xl">{item.icon}</span>
            <div className="flex-1 min-w-0">
                <p className="font-heading text-sm text-text-heading truncate">
                    @{item.username}
                </p>
                <p className="text-xs text-text-dim font-handwriting truncate">
                    {item.achievement}
                </p>
            </div>
            <span className="text-xs text-text-dim whitespace-nowrap">
                {item.time}
            </span>
        </motion.div>
    );
}

export function ActivityFeed() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('top'); // For mobile

    const tabs = [
        { id: 'top', label: t('home.tabTopWeek'), icon: FaFire },
        { id: 'recent', label: t('home.tabRecent'), icon: FaBolt },
        { id: 'achievements', label: t('home.tabAchievements'), icon: FaTrophy },
    ];

    return (
        <section className="w-full px-4 md:px-8 py-12">
            <div className="max-w-6xl mx-auto">
                {/* Section header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="h-px flex-1 bg-black/20" />
                    <h2 className="font-heading text-2xl md:text-3xl text-text-heading uppercase tracking-wider">
                        {t('home.communityInAction')}
                    </h2>
                    <div className="h-px flex-1 bg-black/20" />
                </div>

                {/* Mobile tabs */}
                <div className="flex md:hidden border-2 border-black mb-6 overflow-hidden">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-3 font-heading text-sm transition-colors",
                                activeTab === tab.id 
                                    ? "bg-black text-white" 
                                    : "bg-bg-paper text-text-ink hover:bg-black/5"
                            )}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span className="hidden xs:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Desktop grid / Mobile content */}
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Top Builds Column */}
                    <div className={cn(
                        "space-y-4",
                        activeTab !== 'top' && "hidden md:block"
                    )}>
                        <div className="flex items-center gap-2 text-accent-blood">
                            <FaFire className="w-5 h-5" />
                            <h3 className="font-heading text-lg uppercase">{t('home.topThisWeek')}</h3>
                        </div>
                        <div className="space-y-4">
                            {TOP_BUILDS.map((build) => (
                                <BuildCard key={build.id} build={build} t={t} />
                            ))}
                        </div>
                        <button 
                            onClick={() => navigate('/builds?sort=top')}
                            className="w-full py-3 text-center font-heading text-sm text-text-dim hover:text-accent-blood border-2 border-dashed border-black/20 hover:border-accent-blood transition-colors flex items-center justify-center gap-2"
                        >
                            {t('home.viewFullRanking')}
                            <FaChevronRight className="w-3 h-3" />
                        </button>
                    </div>

                    {/* Recent Builds Column */}
                    <div className={cn(
                        "space-y-4",
                        activeTab !== 'recent' && "hidden md:block"
                    )}>
                        <div className="flex items-center gap-2 text-blue-500">
                            <FaBolt className="w-5 h-5" />
                            <h3 className="font-heading text-lg uppercase">{t('home.recentBuilds')}</h3>
                        </div>
                        <div className="space-y-4">
                            {RECENT_BUILDS.map((build) => (
                                <BuildCard key={build.id} build={build} variant="compact" t={t} />
                            ))}
                        </div>
                        <button 
                            onClick={() => navigate('/builds?sort=new')}
                            className="w-full py-3 text-center font-heading text-sm text-text-dim hover:text-blue-500 border-2 border-dashed border-black/20 hover:border-blue-500 transition-colors flex items-center justify-center gap-2"
                        >
                            {t('home.viewAllBuilds')}
                            <FaChevronRight className="w-3 h-3" />
                        </button>
                    </div>

                    {/* Achievements Column */}
                    <div className={cn(
                        "space-y-4",
                        activeTab !== 'achievements' && "hidden md:block"
                    )}>
                        <div className="flex items-center gap-2 text-accent-gold">
                            <FaTrophy className="w-5 h-5" />
                            <h3 className="font-heading text-lg uppercase">{t('home.recentAchievements')}</h3>
                        </div>
                        <div className="bg-bg-paper border-2 border-black shadow-[4px_4px_0px_#000] p-4">
                            {RECENT_ACHIEVEMENTS.map((item) => (
                                <AchievementItem key={item.id} item={item} />
                            ))}
                        </div>
                        <button 
                            onClick={() => navigate('/achievements')}
                            className="w-full py-3 text-center font-heading text-sm text-text-dim hover:text-accent-gold border-2 border-dashed border-black/20 hover:border-accent-gold transition-colors flex items-center justify-center gap-2"
                        >
                            {t('home.viewAllAchievements')}
                            <FaChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
