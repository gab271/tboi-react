import { useCallback, useRef, useState, useEffect } from 'react';

/**
 * Sound effect URLs (placeholder - replace with actual sounds)
 */
const SOUNDS = {
  stamp: '/sounds/stamp.mp3',
  pin: '/sounds/pin.mp3',
  paper: '/sounds/paper.mp3',
  unlock: '/sounds/unlock.mp3',
  hover: '/sounds/hover.mp3'
};

/**
 * Hook for managing sound effects with user preference
 */
export function useSoundEffects() {
  const audioRefs = useRef({});
  const [soundEnabled, setSoundEnabled] = useState(() => {
    // Check localStorage for user preference
    const saved = localStorage.getItem('tboi_sound_enabled');
    return saved !== null ? JSON.parse(saved) : false; // Default to off
  });
  
  // Preload sounds
  useEffect(() => {
    if (soundEnabled) {
      Object.entries(SOUNDS).forEach(([key, url]) => {
        const audio = new Audio(url);
        audio.preload = 'auto';
        audio.volume = 0.3;
        audioRefs.current[key] = audio;
      });
    }
    
    return () => {
      // Cleanup
      Object.values(audioRefs.current).forEach(audio => {
        audio.pause();
        audio.src = '';
      });
      audioRefs.current = {};
    };
  }, [soundEnabled]);
  
  // Toggle sound
  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const newValue = !prev;
      localStorage.setItem('tboi_sound_enabled', JSON.stringify(newValue));
      return newValue;
    });
  }, []);
  
  // Play a sound
  const playSound = useCallback((soundKey) => {
    if (!soundEnabled) return;
    
    const audio = audioRefs.current[soundKey];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Ignore autoplay errors
      });
    }
  }, [soundEnabled]);
  
  return {
    soundEnabled,
    toggleSound,
    playSound,
    sounds: {
      stamp: () => playSound('stamp'),
      pin: () => playSound('pin'),
      paper: () => playSound('paper'),
      unlock: () => playSound('unlock'),
      hover: () => playSound('hover')
    }
  };
}

/**
 * Framer Motion animation variants for common patterns
 */
export const ANIMATION_VARIANTS = {
  // Card drop animation (like being pinned to board)
  pinnedDrop: {
    initial: { 
      opacity: 0, 
      y: -50, 
      rotateX: 45,
      scale: 0.8 
    },
    animate: { 
      opacity: 1, 
      y: 0, 
      rotateX: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 200
      }
    },
    exit: { 
      opacity: 0, 
      y: 50, 
      scale: 0.8 
    }
  },
  
  // Stamp animation
  stamp: {
    initial: { 
      scale: 5, 
      opacity: 0, 
      rotate: -45 
    },
    animate: { 
      scale: 1, 
      opacity: 1, 
      rotate: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200
      }
    }
  },
  
  // Paper slide in
  paperSlide: {
    initial: { x: 100, opacity: 0, rotate: 5 },
    animate: { 
      x: 0, 
      opacity: 1, 
      rotate: 0,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 150
      }
    },
    exit: { x: -100, opacity: 0, rotate: -5 }
  },
  
  // Fade and scale
  fadeScale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  },
  
  // Stagger children
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  },
  
  // Hover lift effect
  hoverLift: {
    rest: { y: 0, scale: 1, boxShadow: "2px 4px 8px rgba(0,0,0,0.3)" },
    hover: { 
      y: -8, 
      scale: 1.02, 
      boxShadow: "4px 12px 24px rgba(0,0,0,0.4)",
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 300
      }
    }
  },
  
  // Pin vibration on hover
  pinVibrate: {
    rest: { rotate: 0 },
    hover: {
      rotate: [0, -5, 5, -3, 3, 0],
      transition: {
        duration: 0.5,
        ease: "easeInOut"
      }
    }
  },
  
  // Pulse attention
  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },
  
  // Blood drip
  drip: {
    animate: {
      y: [0, 5, 0],
      scaleY: [1, 1.2, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }
};

/**
 * CSS animation keyframes to add to global styles
 */
export const CSS_ANIMATIONS = `
  @keyframes pinned-drop {
    0% {
      opacity: 0;
      transform: translateY(-30px) rotateX(30deg) scale(0.9);
    }
    60% {
      opacity: 1;
      transform: translateY(5px) rotateX(-5deg) scale(1.02);
    }
    100% {
      opacity: 1;
      transform: translateY(0) rotateX(0) scale(1);
    }
  }
  
  @keyframes stamp-press {
    0% {
      transform: scale(3) rotate(-30deg);
      opacity: 0;
    }
    50% {
      transform: scale(0.95) rotate(2deg);
      opacity: 1;
    }
    75% {
      transform: scale(1.05) rotate(-1deg);
    }
    100% {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
  }
  
  @keyframes drip {
    0%, 100% {
      transform: scaleY(1) translateY(0);
    }
    50% {
      transform: scaleY(1.3) translateY(3px);
    }
  }
  
  @keyframes paper-rustle {
    0%, 100% {
      transform: rotate(-1deg);
    }
    50% {
      transform: rotate(1deg);
    }
  }
  
  @keyframes glow-pulse {
    0%, 100% {
      box-shadow: 0 0 5px rgba(139, 0, 0, 0.3);
    }
    50% {
      box-shadow: 0 0 20px rgba(139, 0, 0, 0.6);
    }
  }
  
  .animate-pinned-drop {
    animation: pinned-drop 0.6s ease-out forwards;
    animation-fill-mode: both;
  }
  
  .animate-stamp {
    animation: stamp-press 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  }
  
  .animate-drip {
    animation: drip 2s ease-in-out infinite;
  }
  
  .animate-paper-rustle {
    animation: paper-rustle 3s ease-in-out infinite;
  }
  
  .animate-glow-pulse {
    animation: glow-pulse 2s ease-in-out infinite;
  }
`;

/**
 * Hook for entrance animations with stagger
 */
export function useStaggeredEntrance(itemCount, baseDelay = 0.05, maxDelay = 1.5) {
  return useCallback((index) => ({
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        delay: Math.min(index * baseDelay, maxDelay),
        duration: 0.4,
        ease: "easeOut"
      }
    }
  }), [baseDelay, maxDelay]);
}

/**
 * Hook for parallax scroll effect
 */
export function useParallax(speed = 0.5) {
  const [offset, setOffset] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.pageYOffset * speed);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);
  
  return offset;
}

export default {
  useSoundEffects,
  ANIMATION_VARIANTS,
  CSS_ANIMATIONS,
  useStaggeredEntrance,
  useParallax
};
