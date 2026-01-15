import React from 'react';
import { Hero } from './Hero';
import { LiveTicker } from './LiveTicker';
import { FeaturesGrid } from './FeaturesGrid';

export function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-bg-0 text-fg overflow-x-hidden">
      
      {/* 1. Immersive Hero Section */}
      <Hero />
      
      {/* 2. Live Data Feed (Infinite Marquee) */}
      <LiveTicker />

      {/* 3. Main Navigation Grid (Bento Style) */}
      <FeaturesGrid />

      {/* 4. Footer CTA / Ambient Ender */}
      <section className="py-32 relative flex items-center justify-center text-center overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-t from-black via-bg-0 to-bg-0 z-0" />
         <div className="relative z-10 container px-6">
            <h2 className="text-4xl md:text-6xl font-serif font-bold mb-6 text-blood opacity-80">
                TRUST NO ONE
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
                The deeper you go, the more you discover. 
                <br/>Log in to save your favorite discoveries.
            </p>
         </div>
      </section>

    </div>
  );
}
