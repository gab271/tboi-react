// CSS Module for particle animations
import { cn } from '../../lib/utils';
import React, { useEffect, useState } from 'react';

// Random number generator within a range
const random = (min, max) => Math.random() * (max - min) + min;

export const DustParticles = ({ count = 30 }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate static dust particles on mount to avoid hydration mismatch
    // (In a real app, we might want to suppress hydration warning or use a client-only wrapper,
    // but useEffect works fine for visual decorations).
    const newParticles = Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: random(0, 100) + '%',
      top: random(0, 100) + '%',
      size: random(2, 6) + 'px',
      duration: random(10, 25) + 's',
      delay: random(0, 5) + 's',
      opacity: random(0.1, 0.4)
    }));
    setParticles(newParticles);
  }, [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <style>
        {`
          @keyframes float-up {
            0% { transform: translateY(0) translateX(0); opacity: 0; }
            50% { opacity: var(--target-opacity, 0.5); }
            100% { transform: translateY(-100vh) translateX(20px); opacity: 0; }
          }
          .particle {
            position: absolute;
            background: rgba(255, 255, 255, 0.6);
            border-radius: 50%;
            filter: blur(1px);
            animation-name: float-up;
            animation-timing-function: linear;
            animation-iteration-count: infinite;
          }
        `}
      </style>
      
      {particles.map((p) => (
        <div 
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            top: p.top, // Start position (will loop due to animation)
            width: p.size,
            height: p.size,
            '--target-opacity': p.opacity,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        />
      ))}
      
      {/* Vignette Overlay (CSS Radial Gradient) */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.4) 50%, rgba(9,9,9,1) 100%)'
        }}
      />
    </div>
  );
};
