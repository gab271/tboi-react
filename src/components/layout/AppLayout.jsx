import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function AppLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center py-10 px-4 bg-bg-floor relative overflow-hidden">
      {/* Texture Overlay handled in global CSS on body, but we ensure wrapper is correct */}
      
      {/* The Paper Container */}
      <div className="relative w-full max-w-7xl bg-bg-paper text-text-ink paper-shadow -rotate-1 mx-auto min-h-[85vh] flex flex-col p-4 sm:p-8 transition-transform duration-500 ease-in-out">
         {/* Paper texture overlay (grain) optional, but nice for depth if not on body */}
         <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] mix-blend-multiply"></div>
         
         {/* Tape or imperfection visual element could go here */}
         
         <div className="relative z-10 flex flex-col flex-1 h-full">
            <Navbar />
            
            <main className="flex-1 mt-8">
              <Outlet />
            </main>

            <div className="mt-12 pt-8 border-t-2 border-text-ink/20 border-dashed">
               <Footer />
            </div>
         </div>
      </div>
    </div>
  );
}
