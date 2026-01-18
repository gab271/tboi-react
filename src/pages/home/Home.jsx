// Home.jsx - Main Landing Page
import React from 'react';
import { HeroSection } from '../../components/home/HeroSection';
import { MissingPosterSection } from '../../components/home/MissingPosterSection';
import { NavigationCards } from '../../components/home/NavigationCards';
import { ConnectorLine } from '../../components/home/Decorations';

export function Home() {
  return (
    <div className="flex flex-col gap-10 md:gap-16 pb-20 relative">
      
      {/* Hero Section - Map & Welcome */}
      <HeroSection />

      {/* Exploration Grid */}
      <section className="px-4 md:px-0 relative z-10">
          <div className="flex items-center gap-4 mb-12">
             <div className="h-0 flex-1 border-t-2 border-dashed border-black/20"></div>
             <h3 className="font-heading text-3xl md:text-4xl text-text-ink uppercase tracking-widest text-center">Explore the Depths</h3>
             <div className="h-0 flex-1 border-t-2 border-dashed border-black/20"></div>
          </div>

          <NavigationCards />
      </section>

      {/* Visual Connector Line (Absolute behind content) */}
      <div className="absolute top-[800px] left-1/2 -translate-x-1/2 w-[2px] h-[500px] hidden lg:block -z-10">
          <svg className="h-full w-20 overflow-visible">
            <path 
                d="M 10 0 Q 60 250 10 500" 
                fill="none" 
                stroke="#000" 
                strokeWidth="2" 
                strokeDasharray="8 8" 
                opacity="0.1" 
            />
          </svg>
      </div>

      {/* Missing Poster (Login CTA) with Decorations */}
      <MissingPosterSection />
    </div>
  );
}
