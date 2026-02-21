// PremiumTeaser.jsx - Subtle premium upsell section
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaChartLine, FaDownload, FaMagic, FaDesktop, FaBan, FaMedal, FaQuoteLeft } from 'react-icons/fa';

const PREMIUM_FEATURES = [
    { icon: FaChartLine, text: 'Stats avanzadas de tus runs' },
    { icon: FaDownload, text: 'Importador de saves automático' },
    { icon: FaMagic, text: 'Recomendador de ítems con IA' },
    { icon: FaDesktop, text: 'Overlay para streaming' },
    { icon: FaBan, text: 'Sin anuncios' },
    { icon: FaMedal, text: 'Badge exclusivo de supporter' },
];

const TESTIMONIAL = {
    text: "El recomendador me salvó 3 runs esta semana. Vale cada centavo.",
    author: "@TaintedFan",
};

export function PremiumTeaser() {
    const navigate = useNavigate();

    return (
        <section className="w-full px-4 md:px-8 py-12">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative bg-gradient-to-br from-bg-paper to-[#f5f0e6] border-2 border-accent-gold/30 shadow-[0_0_30px_rgba(212,175,55,0.1)] overflow-hidden"
                >
                    {/* Gold accent line */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent-gold to-transparent" />
                    
                    {/* Noise overlay */}
                    <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />

                    <div className="relative p-6 md:p-10">
                        {/* Header */}
                        <div className="flex items-center gap-2 mb-6">
                            <FaStar className="w-5 h-5 text-accent-gold" />
                            <h2 className="font-heading text-xl md:text-2xl text-text-heading uppercase">
                                ¿Quieres ir más allá?
                            </h2>
                        </div>

                        {/* Features grid */}
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
                            {PREMIUM_FEATURES.map((feature, index) => (
                                <motion.div
                                    key={feature.text}
                                    initial={{ opacity: 0, x: -10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-center gap-3 p-3 bg-white/50 border border-accent-gold/20"
                                >
                                    <feature.icon className="w-4 h-4 text-accent-gold flex-shrink-0" />
                                    <span className="text-sm font-handwriting text-text-ink">
                                        {feature.text}
                                    </span>
                                </motion.div>
                            ))}
                        </div>

                        {/* CTA and testimonial */}
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            {/* CTA */}
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <button
                                    onClick={() => navigate('/premium')}
                                    className="px-8 py-3 bg-accent-gold text-black font-heading text-lg border-2 border-black shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] hover:-translate-y-1 transition-all"
                                >
                                    Ver planes
                                </button>
                                <span className="text-sm text-text-dim font-handwriting">
                                    7 días gratis, cancela cuando quieras
                                </span>
                            </div>

                            {/* Testimonial */}
                            <div className="flex items-start gap-3 max-w-xs">
                                <FaQuoteLeft className="w-4 h-4 text-accent-gold/50 flex-shrink-0 mt-1" />
                                <div>
                                    <p className="text-sm font-handwriting text-text-ink italic">
                                        &quot;{TESTIMONIAL.text}&quot;
                                    </p>
                                    <p className="text-xs text-text-dim mt-1">
                                        — {TESTIMONIAL.author}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
