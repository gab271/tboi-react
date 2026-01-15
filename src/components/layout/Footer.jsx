import React from 'react';
import { FaGithub, FaDiscord, FaTwitter, FaArrowUp, FaEnvelope, FaHeart } from 'react-icons/fa';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Link } from 'react-router-dom';

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative w-full bg-bg-0 border-t border-gold/10 mt-24 pt-16 pb-8 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-[128px] pointer-events-none -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none translate-y-1/2" />

        <div className="container mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
                
                {/* Brand Column */}
                <div className="md:col-span-4 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-gradient-to-br from-gold/20 to-transparent border border-gold/20 text-gold shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                           <span className="text-2xl">⚡</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-serif font-bold text-xl text-fg tracking-wide">TBOI: Codex</span>
                            <span className="text-[10px] uppercase tracking-[0.2em] text-gold/80 font-medium">Ultimate Wiki</span>
                        </div>
                    </div>
                    <p className="text-muted text-sm leading-relaxed max-w-xs">
                        The definitive community-driven knowledge base for The Binding of Isaac: Repentance. 
                        Discover items, defeat bosses, and master every run.
                    </p>
                    <div className="flex gap-3">
                         <SocialButton icon={FaDiscord} href="#" label="Discord" />
                         <SocialButton icon={FaGithub} href="#" label="GitHub" />
                         <SocialButton icon={FaTwitter} href="#" label="Twitter" />
                    </div>
                </div>

                {/* Database Links */}
                <div className="md:col-span-2 md:col-start-6 space-y-4">
                    <h4 className="text-gold font-serif font-bold tracking-widest text-sm uppercase mb-6">Database</h4>
                    <FooterLink to="/items">Items</FooterLink>
                    <FooterLink to="/bosses">Bosses</FooterLink>
                    <FooterLink to="/characters">Characters</FooterLink>
                    <FooterLink to="/builds">Builds</FooterLink>
                </div>

                {/* Community/Legal Links */}
                 <div className="md:col-span-2 space-y-4">
                    <h4 className="text-gold font-serif font-bold tracking-widest text-sm uppercase mb-6">Community</h4>
                    <FooterLink to="/about">About Us</FooterLink>
                    <FooterLink to="/contribute">Contribute</FooterLink>
                    <FooterLink to="/api-docs">API Docs</FooterLink>
                    <FooterLink to="/privacy">Privacy Policy</FooterLink>
                </div>

                {/* Newsletter */}
                <div className="md:col-span-3 space-y-4">
                    <h4 className="text-gold font-serif font-bold tracking-widest text-sm uppercase mb-6">Stay Updated</h4>
                    <p className="text-xs text-muted mb-4">Join our newsletter for the latest game updates and community highlights.</p>
                    <div className="flex flex-col gap-2">
                         <div className="flex gap-2">
                            <Input placeholder="Enter your email" className="bg-bg-1 border-white/10 h-10 text-sm" />
                            <Button size="icon" className="bg-gold hover:bg-gold/80 text-black h-10 w-10 shrink-0">
                                <FaEnvelope />
                            </Button>
                         </div>
                         <span className="text-[10px] text-muted-2">No spam, just Isaac. Unsubscribe anytime.</span>
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

            {/* Bottom Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted">
                <div className="flex items-center gap-1">
                     <span>&copy; {new Date().getFullYear()} Basement Bible. Made with</span>
                     <FaHeart className="text-red-500 mx-1 animate-pulse" />
                     <span>by the Community.</span>
                </div>
                
                <div className="flex items-center gap-6">
                    <span>Not affiliated with Edmund McMillen or Nicalis.</span>
                    <button 
                        onClick={scrollToTop} 
                        className="flex items-center gap-2 text-gold hover:text-white transition-colors group"
                    >
                        Back to Top <FaArrowUp className="group-hover:-translate-y-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    </footer>
  );
}

function SocialButton({ icon: Icon, href, label }) {
    return (
        <a 
            href={href} 
            className="h-9 w-9 flex items-center justify-center rounded-lg bg-bg-1 border border-white/5 text-muted hover:text-gold hover:border-gold/30 hover:bg-gold/5 transition-all duration-300"
            aria-label={label}
        >
            <Icon size={16} />
        </a>
    );
}

function FooterLink({ to, children }) {
    return (
        <Link 
            to={to} 
            className="block text-sm text-muted hover:text-gold hover:translate-x-1 transition-all duration-300 w-fit"
        >
            {children}
        </Link>
    );
}
