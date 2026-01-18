// Home.jsx - Main Landing Page
import React from 'react';
import { HeroSection } from '../../components/home/HeroSection';
import { MissingPoster } from '../../components/home/MissingPoster';
import { NavigationCards } from '../../components/home/NavigationCards';

export function Home() {
  return (
    <div className="flex flex-col gap-16 md:gap-24 pb-20">
      
      {/* Hero Section - Map & Welcome */}
      <HeroSection />

      {/* Exploration Grid */}
      <section className="px-4 md:px-0">
          <div className="flex items-center gap-4 mb-12">
             <div className="h-0 flex-1 border-t-2 border-dashed border-black/20"></div>
             <h3 className="font-heading text-3xl md:text-4xl text-text-ink uppercase tracking-widest text-center">Explore the Depths</h3>
             <div className="h-0 flex-1 border-t-2 border-dashed border-black/20"></div>
          </div>

          <NavigationCards />
      </section>

      {/* Missing Poster (Login CTA) */}
      <MissingPoster />
    </div>
  );
}
