// MinimalFooter.jsx - Compact footer for redesigned home
import { useTranslation } from 'react-i18next';
import { FaDiscord, FaGithub, FaTwitter, FaSkull } from 'react-icons/fa';

const SOCIAL_LINKS = [
    { icon: FaDiscord, href: '#', label: 'Discord' },
    { icon: FaGithub, href: '#', label: 'GitHub' },
    { icon: FaTwitter, href: '#', label: 'Twitter' },
];

const LEGAL_LINKS = [
    { labelKey: 'privacy', href: '/privacy' },
    { labelKey: 'terms', href: '/terms' },
    { labelKey: 'contact', href: '/contact' },
];

export function MinimalFooter() {
    const { t } = useTranslation();
    
    return (
        <footer className="w-full px-4 md:px-8 py-8 border-t border-black/10">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Left - Branding */}
                    <div className="flex items-center gap-2 text-text-dim">
                        <FaSkull className="w-4 h-4" />
                        <span className="font-handwriting text-sm">
                            {t('footer.madeWithLove')}
                        </span>
                    </div>

                    {/* Center - Social */}
                    <div className="flex items-center gap-4">
                        {SOCIAL_LINKS.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                aria-label={link.label}
                                className="w-10 h-10 flex items-center justify-center border border-black/10 text-text-dim hover:text-accent-blood hover:border-accent-blood transition-colors"
                            >
                                <link.icon className="w-4 h-4" />
                            </a>
                        ))}
                    </div>

                    {/* Right - Legal */}
                    <div className="flex items-center gap-4 text-xs text-text-dim">
                        {LEGAL_LINKS.map((link, index) => (
                            <span key={link.labelKey} className="flex items-center gap-4">
                                <a href={link.href} className="hover:text-text-ink transition-colors">
                                    {t(`footer.${link.labelKey}`)}
                                </a>
                                {index < LEGAL_LINKS.length - 1 && (
                                    <span className="text-black/20">·</span>
                                )}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Copyright */}
                <p className="text-center text-xs text-text-dim/60 mt-6">
                    {t('footer.copyright')}
                </p>
            </div>
        </footer>
    );
}
