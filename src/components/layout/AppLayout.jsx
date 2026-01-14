import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col font-sans text-fg antialiased selection:bg-blood selection:text-white">
      <Navbar />
      {/* Adjusted pt-24 to ensure content is below the fixed navbar */}
      <main className="flex-1 pt-24 relative z-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
