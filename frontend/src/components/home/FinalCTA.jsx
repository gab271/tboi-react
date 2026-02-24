// FinalCTA.jsx - Final registration push section
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaEnvelope, FaDiscord } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';

export function FinalCTA() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { user } = useAuth();

    // Don't show if user is already logged in
    if (user) return null;

    return (
        <section className="w-full px-4 md:px-8 py-16">
            <div className="max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative bg-[#0c0a09] text-white overflow-hidden"
                >
                    {/* Basement texture overlay */}
                    <div 
                        className="absolute inset-0 opacity-20"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                        }}
                    />
                    
                    {/* Vignette effect */}
                    <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/50 pointer-events-none" />

                    <div className="relative p-8 md:p-12 text-center">
                        {/* Headline */}
                        <motion.h2
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="font-heading text-2xl md:text-4xl uppercase tracking-tight mb-4"
                        >
                            {t('home.finalCtaTitle')}
                            <br />
                            <span className="text-accent-blood">{t('home.finalCtaHighlight')}</span>
                        </motion.h2>

                        {/* Subtext */}
                        <p className="font-handwriting text-lg md:text-xl text-white/70 mb-8 max-w-lg mx-auto">
                            {t('home.finalCtaSubtext')}
                        </p>

                        {/* CTA buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                            <button
                                onClick={() => navigate('/auth/register')}
                                className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-accent-blood text-white font-heading text-lg border-2 border-white/20 hover:bg-white hover:text-accent-blood transition-all"
                            >
                                <FaEnvelope className="w-5 h-5" />
                                {t('home.finalCtaRegisterEmail')}
                            </button>
                            <button
                                onClick={() => navigate('/auth/discord')}
                                className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-[#5865F2] text-white font-heading text-lg border-2 border-white/20 hover:bg-white hover:text-[#5865F2] transition-all"
                            >
                                <FaDiscord className="w-5 h-5" />
                                {t('home.finalCtaContinueDiscord')}
                            </button>
                        </div>

                        {/* Trust message */}
                        <p className="text-sm text-white/50">
                            {t('home.finalCtaTrustMessage')}
                        </p>

                        {/* Login link */}
                        <p className="mt-4 text-sm text-white/50">
                            {t('home.finalCtaHaveAccount')}{' '}
                            <button 
                                onClick={() => navigate('/auth/login')}
                                className="text-accent-gold hover:underline"
                            >
                                {t('home.finalCtaSignIn')}
                            </button>
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
