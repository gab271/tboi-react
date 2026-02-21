// ShareableProfile.jsx - Perfil que el usuario quiere compartir
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaShare, FaDiscord, FaTwitter, FaCopy, FaCheck, FaTrophy, FaSkull, FaBolt, FaMedal, FaFire, FaGem } from 'react-icons/fa';
import { cn } from '../../lib/utils';

// Definición de badges
const BADGES = {
    dead_god: {
        id: 'dead_god',
        name: 'Dead God',
        icon: FaTrophy,
        color: 'accent-gold',
        bgGradient: 'from-yellow-400 to-amber-600',
        condition: (stats) => stats.percentage === 100,
        description: '100% completado'
    },
    masochist: {
        id: 'masochist',
        name: 'Masoquista',
        icon: FaSkull,
        color: 'accent-blood',
        bgGradient: 'from-red-500 to-red-700',
        condition: (stats) => stats.taintedCompletion === 100,
        description: '100% Tainted completado'
    },
    speedrunner: {
        id: 'speedrunner',
        name: 'Speedrunner',
        icon: FaBolt,
        color: 'blue-500',
        bgGradient: 'from-blue-400 to-blue-600',
        condition: (stats) => stats.avgRunTime < 25,
        description: 'Promedio <25 min por run'
    },
    veteran: {
        id: 'veteran',
        name: 'Veterano',
        icon: FaMedal,
        color: 'purple-500',
        bgGradient: 'from-purple-400 to-purple-600',
        condition: (stats) => stats.totalRuns >= 500,
        description: '500+ runs jugadas'
    },
    streak_master: {
        id: 'streak_master',
        name: 'En Racha',
        icon: FaFire,
        color: 'orange-500',
        bgGradient: 'from-orange-400 to-red-500',
        condition: (stats) => stats.currentStreak >= 10,
        description: '10+ victorias seguidas'
    },
    hitless: {
        id: 'hitless',
        name: 'Intocable',
        icon: FaGem,
        color: 'cyan-400',
        bgGradient: 'from-cyan-300 to-cyan-500',
        condition: (stats) => stats.hitlessRuns >= 5,
        description: '5+ runs sin daño'
    }
};

// Estilos de juego detectables
const PLAY_STYLES = {
    speedrunner: { name: 'Speedrunner', desc: 'Runs rápidas y eficientes' },
    strategist: { name: 'Estratega', desc: 'Runs largas y calculadas' },
    angel: { name: 'Ángel', desc: 'Prefiere Angel Rooms' },
    devil: { name: 'Demonio', desc: 'Prefiere Devil Deals' },
    risk_taker: { name: 'Arriesgado', desc: 'Toma muchos riesgos' },
    collector: { name: 'Coleccionista', desc: 'Explora todo' }
};

// Mock data
const MOCK_PROFILE = {
    username: 'EdmundFan',
    avatar: null,
    percentage: 67,
    totalRuns: 247,
    winrate: 63,
    currentStreak: 5,
    bestStreak: 12,
    mainCharacter: { name: 'Azazel', runs: 89, sprite: '/sprites/0_Characters/0_Vanilla/Azazel.png' },
    playStyle: 'strategist',
    topPercentile: 23,
    taintedCompletion: 45,
    avgRunTime: 34,
    hitlessRuns: 2,
    recentAchievement: { name: 'Completó Tainted Lost', date: '2 días' },
    badges: ['veteran', 'streak_master']
};

export function ShareableProfile({ profile = MOCK_PROFILE, isOwnProfile = true }) {
    const [copied, setCopied] = useState(false);

    // Calcular badges ganados
    const earnedBadges = Object.values(BADGES).filter(badge => 
        profile.badges?.includes(badge.id) || badge.condition(profile)
    );

    const playStyle = PLAY_STYLES[profile.playStyle] || PLAY_STYLES.strategist;
    const profileUrl = `isaaccompanion.gg/@${profile.username}`;

    const handleCopyLink = async () => {
        await navigator.clipboard.writeText(`https://${profileUrl}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShareDiscord = () => {
        const text = `🎮 Mi perfil en Isaac Companion\n${profile.percentage}% → Dead God | ${profile.winrate}% winrate\nhttps://${profileUrl}`;
        window.open(`https://discord.com/channels/@me?text=${encodeURIComponent(text)}`, '_blank');
    };

    const handleShareTwitter = () => {
        const text = `🎮 Mi progreso en The Binding of Isaac:\n${profile.percentage}% hacia Dead God\n${profile.totalRuns} runs | ${profile.winrate}% winrate\n\n#BindingOfIsaac #DeadGod`;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=https://${profileUrl}`, '_blank');
    };

    return (
        <div className="max-w-md mx-auto">
            {/* Profile Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-bg-paper border-[3px] border-black shadow-[8px_8px_0px_#000] overflow-hidden"
            >
                {/* Header with gradient */}
                <div className="relative bg-gradient-to-br from-black via-gray-900 to-black p-6 text-center">
                    {/* Decorative pattern */}
                    <div 
                        className="absolute inset-0 opacity-10"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h2V0h2v20h2V0h2v20h2V0h2v20h2V0h2v22H20v-1.5z' fill='%23ffffff' fill-opacity='0.1'/%3E%3C/svg%3E")`
                        }}
                    />
                    
                    {/* Avatar */}
                    <div className="relative inline-block mb-4">
                        <div className="w-20 h-20 bg-white/10 border-4 border-white/20 overflow-hidden">
                            {profile.avatar ? (
                                <img src={profile.avatar} alt={profile.username} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-3xl font-heading text-white">
                                    {profile.username[0].toUpperCase()}
                                </div>
                            )}
                        </div>
                        {/* Top percentile badge */}
                        <div className="absolute -bottom-2 -right-2 px-2 py-1 bg-accent-gold text-black text-xs font-heading">
                            Top {profile.topPercentile}%
                        </div>
                    </div>

                    {/* Username */}
                    <h2 className="font-heading text-2xl text-white mb-1">
                        @{profile.username}
                    </h2>

                    {/* Play style */}
                    <p className="font-handwriting text-white/70">
                        {playStyle.name} · {playStyle.desc}
                    </p>

                    {/* Badges */}
                    {earnedBadges.length > 0 && (
                        <div className="flex justify-center gap-2 mt-4">
                            {earnedBadges.map(badge => (
                                <motion.div
                                    key={badge.id}
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center",
                                        `bg-gradient-to-br ${badge.bgGradient}`,
                                        "border-2 border-white/30 shadow-lg"
                                    )}
                                    title={`${badge.name}: ${badge.description}`}
                                >
                                    <badge.icon className="w-5 h-5 text-white" />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="p-6">
                    {/* Main stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                        <div>
                            <p className="font-heading text-3xl text-accent-gold">{profile.percentage}%</p>
                            <p className="text-xs text-text-dim font-handwriting">progreso</p>
                        </div>
                        <div>
                            <p className="font-heading text-3xl text-text-heading">{profile.totalRuns}</p>
                            <p className="text-xs text-text-dim font-handwriting">runs</p>
                        </div>
                        <div>
                            <p className="font-heading text-3xl text-green-500">{profile.winrate}%</p>
                            <p className="text-xs text-text-dim font-handwriting">winrate</p>
                        </div>
                    </div>

                    {/* Main character */}
                    <div className="flex items-center gap-3 p-3 bg-black/5 border-2 border-black/10 mb-4">
                        <img 
                            src={profile.mainCharacter.sprite}
                            alt={profile.mainCharacter.name}
                            className="w-12 h-12 pixelated"
                            onError={(e) => { e.target.src = '/sprites/placeholder.png'; }}
                        />
                        <div>
                            <p className="text-xs text-text-dim font-handwriting">Personaje principal</p>
                            <p className="font-heading text-text-heading">
                                {profile.mainCharacter.name}
                                <span className="text-text-dim font-normal"> · {profile.mainCharacter.runs} runs</span>
                            </p>
                        </div>
                    </div>

                    {/* Current streak */}
                    {profile.currentStreak > 0 && (
                        <div className="flex items-center gap-2 p-3 bg-orange-500/10 border-2 border-orange-500/30 mb-4">
                            <FaFire className="w-5 h-5 text-orange-500" />
                            <div>
                                <p className="font-heading text-orange-500">
                                    Racha actual: {profile.currentStreak} victorias
                                </p>
                                <p className="text-xs text-text-dim">
                                    Mejor racha: {profile.bestStreak}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Recent achievement */}
                    {profile.recentAchievement && (
                        <div className="p-3 bg-accent-gold/5 border-2 border-accent-gold/20 mb-6">
                            <p className="text-xs text-accent-gold font-heading uppercase mb-1">
                                Logro reciente
                            </p>
                            <p className="font-handwriting text-text-heading">
                                {profile.recentAchievement.name}
                                <span className="text-text-dim"> · hace {profile.recentAchievement.date}</span>
                            </p>
                        </div>
                    )}

                    {/* Share buttons */}
                    {isOwnProfile && (
                        <div className="space-y-3">
                            <p className="text-xs text-text-dim font-heading uppercase text-center mb-2">
                                Compartir perfil
                            </p>
                            
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={handleCopyLink}
                                    className="flex items-center justify-center gap-2 py-3 bg-black/5 border-2 border-black/20 font-heading text-xs hover:bg-black/10 transition-colors"
                                >
                                    {copied ? <FaCheck className="text-green-500" /> : <FaCopy />}
                                    {copied ? 'Copiado' : 'Copiar'}
                                </button>
                                <button
                                    onClick={handleShareDiscord}
                                    className="flex items-center justify-center gap-2 py-3 bg-[#5865F2] text-white font-heading text-xs hover:bg-[#4752c4] transition-colors"
                                >
                                    <FaDiscord />
                                    Discord
                                </button>
                                <button
                                    onClick={handleShareTwitter}
                                    className="flex items-center justify-center gap-2 py-3 bg-black text-white font-heading text-xs hover:bg-gray-800 transition-colors"
                                >
                                    <FaTwitter />
                                    Twitter
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer with URL */}
                <div className="bg-black/5 px-6 py-3 text-center border-t-2 border-black/10">
                    <p className="text-sm text-text-dim font-mono">
                        {profileUrl}
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

// Mini profile card for embeds
export function ProfileCard({ profile = MOCK_PROFILE }) {
    return (
        <div className="inline-flex items-center gap-3 p-3 bg-bg-paper border-2 border-black shadow-[3px_3px_0px_#000]">
            <div className="w-10 h-10 bg-black/10 flex items-center justify-center font-heading text-lg">
                {profile.username[0].toUpperCase()}
            </div>
            <div>
                <p className="font-heading text-sm">@{profile.username}</p>
                <p className="text-xs text-text-dim">
                    {profile.percentage}% · {profile.winrate}% WR
                </p>
            </div>
        </div>
    );
}
