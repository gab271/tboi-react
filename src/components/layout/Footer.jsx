import React from 'react';import { FaGithub, FaDiscord, FaTwitter } from 'react-icons/fa';export function Footer() {  return (    <footer className="w-full border-t border-border bg-bg-1/30 py-12 mt-20 relative overflow-hidden">      {/* Decorative gradient */}      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />            <div className="container mx-auto px-4 relative z-10">        <div className="flex flex-col md:flex-row justify-between items-center gap-6">                    <div className="flex flex-col items-center md:items-start text-center md:text-left">             <div className="flex items-center gap-2 mb-2 group cursor-default">                <span className="text-xl group-hover:scale-125 transition-transform duration-300">⚡</span>                <span className="font-serif font-bold text-fg group-hover:text-gold transition-colors">TBOI: Codex</span>             </div>             <p className="text-sm text-muted max-w-xs">               Fan-made wiki for The Binding of Isaac: Repentance.                Not affiliated with Edmund McMillen or Nicalis.             </p>          </div>          <div className="flex gap-4">            <a href="#" className="p-2 rounded-full bg-bg-2 border border-border hover:border-gold/50 hover:text-gold hover:-translate-y-1 transition-all"><FaGithub size={18} /></a>            <a href="#" className="p-2 rounded-full bg-bg-2 border border-border hover:border-gold/50 hover:text-gold hover:-translate-y-1 transition-all"><FaDiscord size={18} /></a>            <a href="#" className="p-2 rounded-full bg-bg-2 border border-border hover:border-gold/50 hover:text-gold hover:-translate-y-1 transition-all"><FaTwitter size={18} /></a>          </div>                  </div>        
        <div className="mt-8 flex flex-col md:flex-row justify-between items-center text-[10px] text-muted-2 uppercase tracking-widest gap-4">
           <span>&copy; {new Date().getFullYear()} Basement Bible</span>
           <div className="flex gap-4">
              <span className="hover:text-gold cursor-pointer transition-colors">Privacy</span>
              <span className="hover:text-gold cursor-pointer transition-colors">Terms</span>
              <span className="hover:text-gold cursor-pointer transition-colors">Credits</span>
           </div>
        </div>
      </div>
    </footer>
  );
}
