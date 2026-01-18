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
    <footer 
        className="relative w-full border-t border-stone-700 mt-12 bg-[#0c0c0c] text-stone-200 shadow-[inset_0_10px_30px_rgba(0,0,0,0.8)]"
        style={{
             // Irregular "Torn Paper" Bottom Edge
             // This complex polygon creates random "teeth" at non-uniform intervals to simulate ripping
             clipPath: `polygon(
                 0% 0%, 100% 0%, 100% 100%, 
                 97% 96%, 94% 98%, 90% 95%, 85% 98%, 82% 96%, 78% 99%, 74% 95%, 
                 70% 98%, 66% 96%, 63% 99%, 58% 95%, 54% 98%, 50% 96%, 46% 99%, 
                 42% 95%, 38% 98%, 34% 96%, 30% 99%, 26% 95%, 22% 98%, 18% 96%, 
                 14% 99%, 10% 95%, 6% 98%, 3% 96%, 0% 100%
             )`,
             paddingBottom: '120px', // Prevents content from being cut by the torn edge
             marginBottom: '-80px' // Pulls the floor up slightly to close visual gaps if needed
        }}
    >
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-[128px] pointer-events-none -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none translate-y-1/2" />

        <div className="container mx-auto px-12 pt-16 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
                
                {/* Brand Column */}
                <div className="md:col-span-4 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-gradient-to-br from-gold/5 to-transparent border border-gold/10 text-gold shadow-[0_0_15px_rgba(234,179,8,0.1)] overflow-hidden">
                           <img src="/isaac.png" alt="Isaac" className="w-full h-full object-contain opacity-80" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-pixel text-3xl text-stone-100 tracking-wider drop-shadow-sm">TBOI: Codex</span>
                            <span className="text-[10px] uppercase tracking-[0.2em] text-gold/90 font-medium">Ultimate Wiki</span>
                        </div>
                    </div>
                    <p className="text-stone-300 font-medium text-sm leading-relaxed max-w-xs text-shadow-sm">
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
                <div className="md:col-span-2 md:col-start-6 space-y-6">
                    <h4 className="text-gold font-pixel text-2xl tracking-widest uppercase mb-4 drop-shadow-[0_2px_0_rgba(0,0,0,1)]">Database</h4>
                    <FooterLink to="/items">Items</FooterLink>
                    <FooterLink to="/bosses">Bosses</FooterLink>
                    <FooterLink to="/characters">Characters</FooterLink>
                    <FooterLink to="/builds">Builds</FooterLink>
                </div>

                {/* Community/Legal Links */}
                 <div className="md:col-span-2 space-y-6">
                    <h4 className="text-gold font-pixel text-2xl tracking-widest uppercase mb-4 drop-shadow-[0_2px_0_rgba(0,0,0,1)]">Community</h4>
                    <FooterLink to="/about">About Us</FooterLink>
                    <FooterLink to="/contribute">Contribute</FooterLink>
                    <FooterLink to="/api-docs">API Docs</FooterLink>
                    <FooterLink to="/privacy">Privacy Policy</FooterLink>
                </div>

                {/* Newsletter */}
                <div className="md:col-span-3 space-y-4">
                    <h4 className="text-gold font-pixel text-2xl tracking-widest uppercase mb-4 drop-shadow-[0_2px_0_rgba(0,0,0,1)] bg-black/50 w-fit px-2">Stay Updated</h4>
                    <p className="text-xs text-stone-300 font-medium mb-4">Join our newsletter for the latest game updates and community highlights.</p>
                    <div className="flex flex-col gap-2">
                         <div className="flex gap-2">
                            <Input placeholder="Enter your email" className="bg-black/60 border-white/10 h-10 text-sm text-stone-200 placeholder:text-stone-500 focus:border-gold/50" />
                            <Button size="icon" className="bg-gold hover:bg-gold/80 text-black h-10 w-10 shrink-0 shadow-[0_0_10px_rgba(234,179,8,0.3)]">
                                <FaEnvelope />
                            </Button>
                         </div>
                         <span className="text-[10px] text-stone-400 font-medium">No spam, just Isaac. Unsubscribe anytime.</span>
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-stone-700 to-transparent mb-8" />

            {/* Bottom Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-stone-400 font-medium mb-8">
                <div className="flex items-center gap-1">
                     <span>&copy; {new Date().getFullYear()} Basement Bible. Made with</span>
                     <FaHeart className="text-red-800 mx-1 animate-pulse drop-shadow-[0_0_5px_rgba(220,38,38,0.5)]" />
                     <span>by the Community.</span>
                </div>
                
                <div className="flex items-center gap-6">
                    <span>Not affiliated with Edmund McMillen or Nicalis.</span>
                    <button 
                        onClick={scrollToTop} 
                        className="flex items-center gap-2 text-gold hover:text-white transition-colors group uppercase font-bold tracking-wider text-[10px]"
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
            className="h-9 w-9 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-stone-300 hover:text-gold hover:border-gold/50 hover:bg-gold/10 hover:shadow-[0_0_15px_rgba(234,179,8,0.4)] transition-all duration-300"
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
            className="block text-base font-medium text-stone-200 hover:text-white hover:pl-2 transition-all duration-200 w-fit drop-shadow-sm"
        >
            {children}
        </Link>
    );
}
