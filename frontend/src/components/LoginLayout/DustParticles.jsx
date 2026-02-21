// CSS Module for particle animations
import { useEffect, useState } from 'react';

// Random number generator within a range
const random = (min, max) => Math.random() * (max - min) + min;

export const DustParticles = ({ count = 30 }) => {
  const [particles, setParticles] = useState([]);
  const [flies, setFlies] = useState([]);

  useEffect(() => {
    // Generate static dust particles on mount
    const newParticles = Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: random(0, 100) + '%',
      top: random(0, 100) + '%',
      size: random(1, 4) + 'px',
      duration: random(15, 30) + 's',
      delay: random(0, 8) + 's',
      opacity: random(0.15, 0.35),
      type: Math.random() > 0.7 ? 'ember' : 'dust'
    }));
    setParticles(newParticles);
    
    // Generate some flies (Isaac-style)
    const newFlies = Array.from({ length: 6 }).map((_, i) => ({
      id: i,
      left: random(10, 90) + '%',
      top: random(10, 90) + '%',
      size: random(2, 4) + 'px',
      duration: random(3, 6) + 's',
      delay: random(0, 2) + 's',
    }));
    setFlies(newFlies);
  }, [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <style>
        {`
          @keyframes float-up {
            0% { transform: translateY(0) translateX(0); opacity: 0; }
            20% { opacity: var(--target-opacity, 0.3); }
            80% { opacity: var(--target-opacity, 0.3); }
            100% { transform: translateY(-100vh) translateX(30px); opacity: 0; }
          }
          
          @keyframes ember-float {
            0% { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
            20% { opacity: var(--target-opacity, 0.5); }
            50% { transform: translateY(-50vh) translateX(20px) scale(0.8); }
            100% { transform: translateY(-100vh) translateX(-10px) scale(0.5); opacity: 0; }
          }
          
          @keyframes fly-wander {
            0%, 100% { transform: translate(0, 0); }
            25% { transform: translate(15px, -10px); }
            50% { transform: translate(-10px, -20px); }
            75% { transform: translate(-15px, 5px); }
          }
          
          .particle {
            position: absolute;
            background: rgba(255, 255, 255, 0.5);
            border-radius: 50%;
            filter: blur(0.5px);
            animation-name: float-up;
            animation-timing-function: linear;
            animation-iteration-count: infinite;
          }
          
          .ember {
            position: absolute;
            background: rgba(255, 140, 60, 0.8);
            border-radius: 50%;
            filter: blur(1px);
            box-shadow: 0 0 4px rgba(255, 100, 50, 0.5);
            animation-name: ember-float;
            animation-timing-function: ease-out;
            animation-iteration-count: infinite;
          }
          
          .fly {
            position: absolute;
            background: #111;
            border-radius: 50%;
            animation-name: fly-wander;
            animation-timing-function: ease-in-out;
            animation-iteration-count: infinite;
          }
        `}
      </style>
      
      {/* Dust & Embers */}
      {particles.map((p) => (
        <div 
          key={p.id}
          className={p.type === 'ember' ? 'ember' : 'particle'}
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            '--target-opacity': p.opacity,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        />
      ))}
      
      {/* Flies */}
      {flies.map((f) => (
        <div 
          key={`fly-${f.id}`}
          className="fly"
          style={{
            left: f.left,
            top: f.top,
            width: f.size,
            height: f.size,
            animationDuration: f.duration,
            animationDelay: f.delay,
          }}
        />
      ))}
    </div>
  );
};
