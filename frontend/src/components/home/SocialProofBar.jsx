// SocialProofBar.jsx - Stats bar showing community activity
import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useInView } from 'framer-motion';
import { FaLayerGroup, FaUsers, FaTrophy, FaBolt } from 'react-icons/fa';

// Mock stats - in production these would come from an API
const STATS = {
    builds: 12453,
    users: 3200,
    achievementsToday: 847,
    lastBuildMinutes: 3,
};

function AnimatedNumber({ value, duration = 1.5 }) {
    const [displayValue, setDisplayValue] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (!isInView) return;

        const start = 0;
        const end = value;
        const startTime = Date.now();
        const endTime = startTime + duration * 1000;

        const animate = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / (endTime - startTime), 1);
            // Easing function (ease-out)
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (end - start) * eased);
            setDisplayValue(current);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [isInView, value, duration]);

    return <span ref={ref}>{displayValue.toLocaleString()}</span>;
}

export function SocialProofBar() {
    const { t } = useTranslation();
    const [lastBuildTime, setLastBuildTime] = useState(STATS.lastBuildMinutes);

    // Simulate live updates
    useEffect(() => {
        const interval = setInterval(() => {
            // Randomly update the "last build" time to simulate activity
            setLastBuildTime(Math.floor(Math.random() * 10) + 1);
        }, 30000); // Every 30 seconds

        return () => clearInterval(interval);
    }, []);

    const stats = [
        {
            icon: FaLayerGroup,
            value: STATS.builds,
            label: t('socialProof.buildsShared'),
            color: 'text-accent-blood',
        },
        {
            icon: FaUsers,
            value: STATS.users,
            label: t('socialProof.activeUsers'),
            color: 'text-accent-gold',
        },
        {
            icon: FaTrophy,
            value: STATS.achievementsToday,
            label: t('socialProof.achievementsToday'),
            color: 'text-green-500',
        },
        {
            icon: FaBolt,
            value: lastBuildTime,
            label: t('socialProof.minSinceLastBuild'),
            color: 'text-blue-500',
            isLive: true,
        },
    ];

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full px-4 md:px-8 py-6"
        >
            <div className="max-w-6xl mx-auto">
                <div className="relative bg-black/5 border-2 border-black/10 backdrop-blur-sm overflow-hidden">
                    {/* Background pattern */}
                    <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />
                    
                    {/* Stats grid */}
                    <div className="relative grid grid-cols-2 md:grid-cols-4 divide-x divide-black/10">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center gap-3 p-4 md:p-6"
                            >
                                <stat.icon className={`w-5 h-5 md:w-6 md:h-6 ${stat.color} flex-shrink-0`} />
                                <div className="min-w-0">
                                    <div className="flex items-baseline gap-1">
                                        <span className="font-heading text-xl md:text-2xl text-text-heading">
                                            {stat.isLive ? (
                                                <span className="tabular-nums">{stat.value}</span>
                                            ) : (
                                                <AnimatedNumber value={stat.value} />
                                            )}
                                        </span>
                                        {stat.isLive && (
                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                        )}
                                    </div>
                                    <p className="text-xs md:text-sm text-text-dim font-handwriting truncate">
                                        {stat.label}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.section>
    );
}
