import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function AppLayout() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col font-sans text-fg antialiased selection:bg-blood selection:text-white">
      <Navbar />
      {/* Adjusted pt-24 to ensure content is below the fixed navbar, unless it's home page which uses hero header */}
      <main className={`flex-1 relative z-10 ${isHome ? '' : 'pt-24'}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
