import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import { FaFire, FaSkull, FaDharmachakra, FaSearch, FaTrophy, FaScroll, FaDiscord, FaSteam, FaTwitch } from 'react-icons/fa';

export function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-16 md:gap-24 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[60vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blood/10 blur-[120px] rounded-full pointer-events-none -z-10 animate-pulse" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_transparent_0%,_var(--bg-0)_100%)] pointer-events-none -z-0" />
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-bg-1/80 border border-gold/20 text-gold text-xs font-bold uppercase tracking-[0.2em] mb-8 backdrop-blur-md shadow-lg animate-fade-in cursor-default hover:border-gold/50 transition-colors">
          <span className="w-1.5 h-1.5 rounded-full bg-gold shadow-[0_0_10px_var(--gold)]" />
          Repentance v1.7.9b
        </div>

        {/* Cinematic Title */}
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif font-black tracking-tighter text-fg mb-6 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] z-10 leading-none">
          BASEMENT <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-blood via-red-600 to-red-900 filter drop-shadow-[0_2px_10px_rgba(220,38,38,0.5)]">
            BIBLE
          </span>
        </h1>
        
        <p className="max-w-2xl text-lg md:text-2xl text-muted font-light leading-relaxed mb-10 z-10">
          The definitive compendium for <span className="text-fg font-medium">The Binding of Isaac</span>. 
          Discover synergies, master boss patterns, and track your achievements.
        </p>

        {/* CTA Group */}
        <div className="flex flex-wrap gap-4 justify-center w-full z-10">
          <Button size="lg" className="h-14 px-8 text-lg shadow-[0_0_20px_rgba(225,29,72,0.3)] hover:shadow-[0_0_30px_rgba(225,29,72,0.5)] transition-all" onClick={() => navigate('/items')}>
            <FaSearch className="mr-2" /> Browse Items
          </Button>
          <Button variant="secondary" size="lg" className="h-14 px-8 text-lg bg-bg-1/50 backdrop-blur border-white/10" onClick={() => navigate('/bosses')}>
             View Bosses
          </Button>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-muted opacity-50">
           <span className="text-xs uppercase tracking-widest">Descend</span>
           <div className="w-px h-8 bg-gradient-to-b from-muted to-transparent mx-auto mt-2" />
        </div>
      </section>


      {/* 2. BENTO GRID NAVIGATION */}
      <section className="container mx-auto px-4">
         <div className="flex flex-col items-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold to-amber-600 mb-2">Knowledge Base</h2>
            <div className="h-1 w-24 bg-gradient-to-r from-transparent via-border to-transparent" />
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[250px]">
            {/* Main Feature: Items */}
            <BentoCard 
               className="md:col-span-2 lg:col-span-2 row-span-2 bg-gradient-to-br from-bg-1 to-bg-0 border-gold/10 hover:border-gold/30 group"
               title="Archive of Artifacts"
               subtitle="Search 700+ Passive & Active Items"
               icon={<FaFire className="text-4xl text-blood group-hover:scale-110 transition-transform duration-500" />}
               onClick={() => navigate('/items')}
            >
               <div className="absolute inset-0 bg-[url('https://static.wikia.nocookie.net/bindingofisaac_gamepedia/images/1/1a/Collectible_Godhead_icon.png/revision/latest?cb=20210821082559')] bg-no-repeat bg-center opacity-5 group-hover:opacity-10 transition-opacity duration-500 scale-150 grayscale group-hover:grayscale-0" />
            </BentoCard>

            {/* Feature: Bosses */}
            <BentoCard 
               className="md:col-span-1 row-span-1 bg-zinc-900 overflow-hidden group"
               title="Bestiary"
               subtitle="Boss strategies & weak points"
               icon={<FaSkull className="text-2xl text-muted group-hover:text-fg transition-colors" />}
               onClick={() => navigate('/bosses')}
            >
               <div className="absolute -right-4 -bottom-4 text-9xl opacity-5 rotate-12 select-none pointer-events-none">💀</div>
            </BentoCard>

            {/* Feature: Characters */}
            <BentoCard 
               className="md:col-span-1 lg:col-span-1 row-span-1 bg-stone-900 group"
               title="The Broken"
               subtitle="Characters & Unlocks"
               icon={<FaDharmachakra className="text-2xl text-tear group-hover:text-cyan-400 transition-colors" />}
               onClick={() => navigate('/characters')}
            >
               <div className="absolute w-full h-1 bg-gradient-to-r from-tear to-transparent bottom-0 left-0" />
            </BentoCard>

             {/* Feature: Challenges (Placeholders) */}
             <BentoCard 
               className="md:col-span-1 bg-bg-1 border-white/5"
               title="Challenges"
               subtitle="Special runs guide"
               icon={<FaTrophy className="text-xl text-gold" />}
            />
            
            {/* Feature: Transformations */}
             <BentoCard 
               className="md:col-span-1 bg-bg-1 border-white/5 group"
               title="Transformations"
               subtitle="Guppy, Spun, Conjoined..."
               icon={<div className="w-6 h-6 rounded bg-gradient-to-tr from-purple-500 to-pink-500" />}
            />
         </div>
      </section>

      {/* 3. LATEST UPDATES (Terminal Style) */}
      <section className="container mx-auto px-4 max-w-4xl">
         <div className="bg-black/40 border border-white/10 rounded-lg p-6 font-mono text-sm relative overflow-hidden">
            <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-4">
               <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
               </div>
               <span className="text-muted ml-2">changelog.txt</span>
            </div>
            
            <div className="space-y-4 text-muted-2">
               <div className="flex gap-4">
                  <span className="text-gold shrink-0">[2024-03-15]</span>
                  <p>Added <span className="text-fg">detailed hitbox data</span> for Delirium.</p>
               </div>
               <div className="flex gap-4">
                  <span className="text-gold shrink-0">[2024-03-10]</span>
                  <p>Updated <span className="text-tear">Tainted Lost</span> strategy guide with new safe spots.</p>
               </div>
               <div className="flex gap-4">
                  <span className="text-gold shrink-0">[2024-02-28]</span>
                  <p>Fixed "Bag of Crafting" calculator not accounting for highly rare pick-ups.</p>
               </div>
               <div className="mt-4 pt-4 border-t border-dashed border-white/10 text-xs uppercase tracking-widest opacity-50">
                  System awaiting input...
               </div>
            </div>
         </div>
      </section>

      {/* 4. STATISTICS & COMMUNITY */}
      <section className="container mx-auto px-4 py-12">
         <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/10">
            <div>
               <div className="text-4xl font-serif font-black text-fg mb-1">719</div>
               <div className="text-xs text-muted uppercase tracking-wider">Total Items</div>
            </div>
            <div>
               <div className="text-4xl font-serif font-black text-fg mb-1">200+</div>
               <div className="text-xs text-muted uppercase tracking-wider">Trinkets</div>
            </div>
            <div>
               <div className="text-4xl font-serif font-black text-fg mb-1">34</div>
               <div className="text-xs text-muted uppercase tracking-wider">Playable Characters</div>
            </div>
            <div>
               <div className="text-4xl font-serif font-black text-fg mb-1">∞</div>
               <div className="text-xs text-muted uppercase tracking-wider">Synergies</div>
            </div>
         </div>
      </section>

      {/* 5. NEWSLETTER / JOIN */}
      <section className="relative py-24 border-y border-white/5 bg-bg-1/20 overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30" />
         <div className="container mx-auto px-4 text-center relative z-10">
            <FaScroll className="text-6xl text-gold/20 mx-auto mb-6" />
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">Join the Community</h2>
            <p className="text-muted max-w-lg mx-auto mb-8">
               Contribute to the wiki, share your wildest runs, and discuss strategies with thousands of other players.
            </p>
            <div className="flex justify-center gap-4">
               <SocialButton icon={<FaDiscord />} label="Discord" />
               <SocialButton icon={<FaSteam />} label="Steam" />
               <SocialButton icon={<FaTwitch />} label="Twitch" />
            </div>
         </div>
      </section>

    </div>
  );
}

// Sub-components for Cleaner Home File
function BentoCard({ title, subtitle, icon, className, children, onClick }) {
   return (
      <div 
         onClick={onClick}
         className={cn(
            "relative bg-bg-1 rounded-xl p-6 border border-border shadow-sm flex flex-col justify-between overflow-hidden hover:shadow-lg transition-all cursor-pointer group",
            className
         )}
      >
         <div className="relative z-10 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
               <div className="p-3 rounded-lg bg-bg-0 border border-white/5 group-hover:border-gold/20 transition-colors">
                  {icon}
               </div>
               <FaSearch className="text-white/10 group-hover:text-gold/50 transition-colors opacity-0 group-hover:opacity-100" />
            </div>
            <div className="mt-auto">
               <h3 className="text-xl font-serif font-bold text-fg group-hover:text-gold transition-colors">{title}</h3>
               {subtitle && <p className="text-sm text-muted mt-1 group-hover:text-muted-foreground transition-colors">{subtitle}</p>}
            </div>
         </div>
         {children}
      </div>
   )
}

function SocialButton({ icon, label }) {
   return (
      <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-bg-2 border border-border hover:border-gold/50 hover:text-gold transition-all">
         {icon}
         <span className="font-medium text-sm">{label}</span>
      </button>
   )
}
