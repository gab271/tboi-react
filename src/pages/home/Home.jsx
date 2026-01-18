// Home.jsx - Main Landing Page
import React from 'react';
import { HeroSection } from '../../components/home/HeroSection';
import { MissingPoster } from '../../components/home/MissingPoster';
import { ContentCard } from '../../components/home/ContentCard';
import { FaSkull, FaDharmachakra, FaDiceD20, FaGhost } from 'react-icons/fa';

export function Home() {
  return (
    <div className="flex flex-col gap-16 md:gap-24 pb-20">
      
      {/* Hero Section - Map & Welcome */}
      <HeroSection />

      {/* Exploration Grid */}
      <section className="px-4 md:px-0">
          <div className="flex items-center gap-4 mb-8">
             <div className="h-1 flex-1 bg-black/10 rounded-full"></div>
             <h3 className="font-heading text-4xl text-text-ink uppercase tracking-widest text-center">Explore the Depths</h3>
             <div className="h-1 flex-1 bg-black/10 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-fr">
             <ContentCard 
                title="Items" 
                description="700+ Items detailed" 
                link="/items" 
                icon={FaDharmachakra} 
                color="bg-[#fff9e6]"
                rotate="-rotate-1"
             />
             <ContentCard 
                title="Bosses" 
                description="Strategies & Drops" 
                link="/bosses" 
                icon={FaSkull} 
                color="bg-[#ffe6e6]"
                rotate="rotate-1"
             />
             <ContentCard 
                title="Characters" 
                description="Stats & Unlocks" 
                link="/characters" 
                icon={FaGhost} 
                color="bg-[#e6f2ff]"
                rotate="-rotate-1"
             />
             <ContentCard 
                title="Builds" 
                description="Synergy Calculator" 
                link="/builds" 
                icon={FaDiceD20} 
                color="bg-[#e6ffe6]"
                rotate="rotate-1"
             />
          </div>
      </section>

      {/* Missing Poster (Login CTA) */}
      <MissingPoster />

    </div>
  );
}
