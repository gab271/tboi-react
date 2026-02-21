// LiveActivitySection.jsx - Prueba social con actividad en tiempo real
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaFire, FaBolt, FaTrophy, FaChevronRight, FaStar, FaComment } from 'react-icons/fa';
import { cn } from '../../../lib/utils';

// Mock data - en producción vendría de la API
const LIVE_ACTIVITIES = [
    { id: 1, user: 'EdmundFan', action: 'subió build', target: '"Brimstone Machine"', time: '3 min', type: 'build' },
    { id: 2, user: 'NorthernLion', action: 'alcanzó', target: 'Dead God', time: '12 min', type: 'achievement' },
    { id: 3, user: 'SinVicta', action: 'completó', target: 'Tainted Lost', time: '28 min', type: 'character' },
    { id: 4, user: 'Hutts', action: 'subió build', target: '"Tech X Chaos"', time: '34 min', type: 'build' },
    { id: 5, user: 'LavolpeTV', action: 'consiguió', target: 'Guppy transformation', time: '45 min', type: 'achievement' },
];

const TOP_BUILDS = [
    {
        id: 1,
        title: 'Brimstone Death Machine',
        author: 'EdmundFan',
        character: { name: 'Tainted Lost', sprite: '/sprites/0_Characters/1_Tainted/Tainted Lost.png' },
        keyItems: [
            { name: 'Brimstone', sprite: '/sprites/1_Passive Items/Brimstone.png' },
            { name: 'Polyphemus', sprite: '/sprites/1_Passive Items/Polyphemus.png' },
        ],
        votes: 234,
        comments: 18,
    },
    {
        id: 2,
        title: 'Echo Chamber Infinite',
        author: 'IsaacPro',
        character: { name: 'Bethany', sprite: '/sprites/0_Characters/0_Vanilla/Bethany.png' },
        keyItems: [
            { name: 'Book of Virtues', sprite: '/sprites/2_Active Items/Book Of Virtues.png' },
            { name: 'Echo Chamber', sprite: '/sprites/1_Passive Items/Echo Chamber.png' },
        ],
        votes: 189,
        comments: 24,
    },
    {
        id: 3,
        title: 'T. Keeper Greed Destroyer',
        author: 'GoldenPenny',
        character: { name: 'Tainted Keeper', sprite: '/sprites/0_Characters/1_Tainted/Tainted Keeper.png' },
        keyItems: [
            { name: 'Pound of Flesh', sprite: '/sprites/1_Passive Items/Pound Of Flesh.png' },
        ],
        votes: 156,
        comments: 12,
    },
];

const TODAY_STATS = {
    deadGods: 47,
    completionMarks: 234,
    taintedLostCompleted: 12,
    newUsers: 89,
};

export function LiveActivitySection() {
    const navigate = useNavigate();
    const [currentActivityIndex, setCurrentActivityIndex] = useState(0);

    // Rotate live activity ticker
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentActivityIndex(prev => (prev + 1) % LIVE_ACTIVITIES.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

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
                        Comunidad activa
                    </div>
                    <h2 className="font-heading text-2xl md:text-3xl text-text-heading uppercase tracking-wider">
                        Lo que está pasando ahora
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
                            <FaBolt className="w-3 h-3" />
                            EN VIVO
                        </div>
                        
                        <div className="flex-1 overflow-hidden">
                            <motion.div
                                key={currentActivityIndex}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex items-center gap-2 font-handwriting text-sm md:text-base"
                            >
                                <span className="text-accent-gold font-heading">
                                    {LIVE_ACTIVITIES[currentActivityIndex].user}
                                </span>
                                <span className="text-white/70">
                                    {LIVE_ACTIVITIES[currentActivityIndex].action}
                                </span>
                                <span className="text-white">
                                    {LIVE_ACTIVITIES[currentActivityIndex].target}
                                </span>
                                <span className="text-white/50 text-xs">
                                    · {LIVE_ACTIVITIES[currentActivityIndex].time}
                                </span>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* Two column layout */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Top Builds - 2 columns */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-heading text-lg text-text-heading uppercase flex items-center gap-2">
                                <FaFire className="text-accent-blood" />
                                Builds Populares
                            </h3>
                            <button 
                                onClick={() => navigate('/builds')}
                                className="text-sm text-accent-blood hover:underline font-heading flex items-center gap-1"
                            >
                                Ver todas <FaChevronRight className="w-3 h-3" />
                            </button>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                            {TOP_BUILDS.map((build, index) => (
                                <BuildCard key={build.id} build={build} index={index} />
                            ))}
                        </div>
                    </div>

                    {/* Today's Stats */}
                    <div>
                        <h3 className="font-heading text-lg text-text-heading uppercase flex items-center gap-2 mb-4">
                            <FaTrophy className="text-accent-gold" />
                            Logros de hoy
                        </h3>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-bg-paper border-[3px] border-black shadow-[4px_4px_0px_#000] p-5"
                        >
                            <div className="space-y-4">
                                <StatRow 
                                    icon="🏆" 
                                    value={TODAY_STATS.deadGods} 
                                    label="Dead Gods conseguidos" 
                                    highlight
                                />
                                <StatRow 
                                    icon="✅" 
                                    value={TODAY_STATS.completionMarks} 
                                    label="Completion marks" 
                                />
                                <StatRow 
                                    icon="💀" 
                                    value={TODAY_STATS.taintedLostCompleted} 
                                    label="Tainted Lost completados" 
                                />
                                <StatRow 
                                    icon="👤" 
                                    value={TODAY_STATS.newUsers} 
                                    label="Nuevos usuarios" 
                                />
                            </div>

                            <div className="mt-6 pt-4 border-t-2 border-dashed border-black/10">
                                <p className="text-xs text-text-dim font-handwriting text-center">
                                    Actualizado hace 2 minutos
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4, boxShadow: '6px 6px 0px #000' }}
            onClick={() => navigate(`/builds/${build.id}`)}
            className="bg-bg-paper border-[3px] border-black shadow-[4px_4px_0px_#000] cursor-pointer transition-all"
        >
            {/* Header with character */}
            <div className="flex items-center gap-3 p-3 border-b-2 border-black/10">
                <img 
                    src={build.character.sprite}
                    alt={build.character.name}
                    className="w-10 h-10 pixelated"
                    onError={(e) => { e.target.src = '/sprites/placeholder.png'; }}
                />
                <div className="flex-1 min-w-0">
                    <h4 className="font-heading text-sm text-text-heading truncate">
                        {build.title}
                    </h4>
                    <p className="text-xs text-text-dim font-handwriting">
                        por @{build.author}
                    </p>
                </div>
            </div>

            {/* Key items */}
            <div className="p-3">
                <div className="flex gap-2 mb-3">
                    {build.keyItems.map((item, i) => (
                        <img 
                            key={i}
                            src={item.sprite}
                            alt={item.name}
                            title={item.name}
                            className="w-8 h-8 pixelated bg-black/5 p-1"
                            onError={(e) => { e.target.src = '/sprites/placeholder.png'; }}
                        />
                    ))}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-text-dim">
                    <span className="flex items-center gap-1">
                        <FaStar className="text-accent-gold" />
                        {build.votes}
                    </span>
                    <span className="flex items-center gap-1">
                        <FaComment />
                        {build.comments}
                    </span>
                </div>
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
