import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../header/Header';
import { Footer } from './Footer';
import { DustParticles } from '../LoginLayout/DustParticles';

export function AppLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center py-0 sm:py-10 px-0 sm:px-4 bg-bg-floor relative overflow-hidden">
      {/* 1. Global Dust Particles */}
      <DustParticles count={50} />

      {/* The Paper Container */}
      <div 
        className="relative w-full max-w-7xl bg-bg-paper text-text-ink -rotate-0 sm:-rotate-1 mx-auto flex flex-col p-4 sm:p-8 transition-transform duration-500 ease-in-out"
        style={{
            minHeight: '100vh',
            // Advanced Torn Paper Clip-Path - RESTORED BUT SAFE
            // Using a simpler clip path for mobile to avoid cutting content
            clipPath: typeof window !== 'undefined' && window.innerWidth >= 640 
              ? 'polygon(0% 10px, 2% 0%, 5% 5px, 10% 0%, 15% 4px, 20% 0%, 25% 6px, 30% 0%, 35% 8px, 40% 0%, 45% 5px, 50% 0%, 55% 7px, 60% 0%, 65% 4px, 70% 0%, 75% 6px, 80% 0%, 85% 5px, 90% 0%, 95% 4px, 100% 0%, 100% 100%, 98% 99%, 95% 96%, 90% 100%, 85% 97%, 80% 100%, 75% 96%, 70% 100%, 65% 97%, 60% 100%, 55% 96%, 50% 100%, 45% 97%, 40% 100%, 35% 96%, 30% 100%, 25% 97%, 20% 100%, 15% 96%, 10% 100%, 5% 97%, 0% 100%)'
              : 'none',
            boxShadow: 'inset 0 0 100px rgba(0,0,0,0.1)', // Inner shadow for depth
            borderWidth: typeof window !== 'undefined' && window.innerWidth < 640 ? '4px' : '0px',
            borderColor: '#e0d8c3',
            borderStyle: 'solid'
        }}
      >
         {/* Torn Edge SVG Mask (Functional for visual edge if detailed mask is preferred) */}
         
         {/* Paper texture overlay (grain) - 5% opacity for physical feel */}
         <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-noise mix-blend-multiply z-20"></div>

         {/* Inner Shadow for "Crumpled" 3D feel */}
         <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.05)] pointer-events-none z-10 rounded-sm"></div>

         <div className="relative z-10 flex flex-col flex-1 h-full">
            <Header />
            
            <main className="flex-1 mt-4 mb-12"> 
              <Outlet />
            </main>

            {/* Seamless transition to footer */}
            <div className="pt-0 border-t-2 border-text-ink/10 border-dashed mt-0">
               <Footer />
            </div>
         </div>
      </div>
    </div>
  );
}
