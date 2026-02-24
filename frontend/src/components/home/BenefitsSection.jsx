// BenefitsSection.jsx - Clear value proposition cards
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaSearch, FaLightbulb, FaChartBar, FaShare } from 'react-icons/fa';
import { cn } from '../../lib/utils';

export function BenefitsSection() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const BENEFITS = [
        {
            icon: FaSearch,
            title: t('benefits.analyzeRuns'),
            description: t('benefits.analyzeRunsDesc'),
            cta: t('benefits.try'),
            ctaLink: '#item-analyzer',
            badge: t('benefits.free'),
            badgeColor: 'bg-green-500',
        },
        {
            icon: FaLightbulb,
            title: t('benefits.discoverSynergies'),
            description: t('benefits.discoverSynergiesDesc'),
            cta: t('benefits.explore'),
            ctaLink: '/synergies',
            badge: t('benefits.free'),
            badgeColor: 'bg-green-500',
        },
        {
            icon: FaChartBar,
            title: t('benefits.trackProgress'),
            description: t('benefits.trackProgressDesc'),
            cta: t('benefits.start'),
            ctaLink: '#progress-tracker',
            badge: t('benefits.free') + '*',
            badgeColor: 'bg-green-500',
            badgeNote: t('benefits.advancedStatsPremium'),
        },
        {
            icon: FaShare,
            title: t('benefits.shareBuilds'),
            description: t('benefits.shareBuildsDesc'),
            cta: t('benefits.create'),
            ctaLink: '/builds/create',
            badge: t('benefits.freeAccount'),
            badgeColor: 'bg-blue-500',
        },
    ];

    const handleClick = (link) => {
        if (link.startsWith('#')) {
            const element = document.getElementById(link.slice(1));
            element?.scrollIntoView({ behavior: 'smooth' });
        } else {
            navigate(link);
        }
    };

    return (
        <section className="w-full px-4 md:px-8 py-12 bg-black/5">
            <div className="max-w-6xl mx-auto">
                {/* Section header */}
                <div className="text-center mb-10">
                    <h2 className="font-heading text-2xl md:text-3xl text-text-heading uppercase tracking-wider mb-2">
                        {t('benefits.title')}
                    </h2>
                    <p className="font-handwriting text-lg text-text-dim">
                        {t('benefits.subtitle')}
                    </p>
                </div>

                {/* Benefits grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {BENEFITS.map((benefit, index) => (
                        <motion.div
                            key={benefit.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -4, boxShadow: '6px 6px 0px #000' }}
                            className="relative bg-bg-paper border-2 border-black shadow-[4px_4px_0px_#000] p-5 flex flex-col"
                        >
                            {/* Badge */}
                            <div className="absolute -top-2 -right-2">
                                <span className={cn(
                                    "px-2 py-0.5 text-xs font-heading text-white",
                                    benefit.badgeColor
                                )}>
                                    {benefit.badge}
                                </span>
                            </div>

                            {/* Icon */}
                            <div className="w-12 h-12 bg-black text-white flex items-center justify-center mb-4">
                                <benefit.icon className="w-6 h-6" />
                            </div>

                            {/* Content */}
                            <h3 className="font-heading text-lg text-text-heading mb-2 uppercase">
                                {benefit.title}
                            </h3>
                            <p className="font-handwriting text-sm text-text-dim flex-1 mb-4">
                                {benefit.description}
                            </p>

                            {/* CTA */}
                            <button
                                onClick={() => handleClick(benefit.ctaLink)}
                                className="w-full py-2 text-center font-heading text-sm border-2 border-black bg-transparent text-black hover:bg-black hover:text-white transition-colors"
                            >
                                {benefit.cta} →
                            </button>

                            {/* Badge note */}
                            {benefit.badgeNote && (
                                <p className="text-[10px] text-text-dim text-center mt-2">
                                    {benefit.badgeNote}
                                </p>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
