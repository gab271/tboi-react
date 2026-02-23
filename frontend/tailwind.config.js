/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ["class"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        heading: ['"Press Start 2P"', 'cursive'], 
        handwriting: ['"Indie Flower"', '"Patrick Hand"', 'cursive'],
        pixel: ['"VT323"', 'monospace'],
        sans: ['"Indie Flower"', 'cursive'], 
      },
      colors: {
        'bg-floor': 'var(--bg-floor)',
        'bg-paper': 'var(--bg-paper)',
        'bg-paper-dark': 'var(--bg-paper-dark)',
        'bg-paper-darker': 'var(--bg-paper-darker)',
        'text-ink': 'var(--text-ink)',
        'text-heading': 'var(--text-heading)',
        'text-secondary': 'var(--text-secondary)',
        'text-dim': 'var(--text-dim)',
        'text-disabled': 'var(--text-disabled)',
        'accent-blood': 'var(--accent-blood)',
        'accent-blood-dark': 'var(--accent-blood-dark)',
        'accent-gold': 'var(--accent-gold)',
        'accent-blue': 'var(--accent-blue)',
        
        // Isaac-specific semantic colors
        'isaac-red': 'var(--accent-blood)',
        'isaac-red-dark': 'var(--accent-blood-dark)',
        
        // Semantic Token Mapping for compatibility
        border: "var(--border-ink)",
        'border-light': "var(--border-light)",
        input: "var(--bg-paper-dark)",
        ring: "var(--accent-blood)",
        background: "var(--bg-paper)",
        foreground: "var(--text-ink)",
        
        // Surface colors for dark UI elements (header when needed)
        surface: {
          DEFAULT: 'var(--bg-paper)',
          raised: 'var(--bg-paper-dark)',
          darker: 'var(--bg-paper-darker)',
        },
        
        bg: {
          0: 'var(--bg-floor)',
          1: 'var(--bg-paper)',
          2: 'var(--bg-paper-dark)',
        },
        fg: 'var(--text-ink)',
        text: {
          DEFAULT: 'var(--text-ink)',
          secondary: 'var(--text-secondary)',
          dim: 'var(--text-dim)',
          disabled: 'var(--text-disabled)',
        },
        muted: {
          DEFAULT: 'var(--text-dim)',
          2: 'var(--text-dim)',
          foreground: 'var(--text-dim)',
        },
        popover: {
          DEFAULT: 'var(--bg-paper)',
          foreground: 'var(--text-ink)',
        },
        card: {
          DEFAULT: 'var(--bg-paper)',
          foreground: 'var(--text-ink)',
        },
        blood: 'var(--accent-blood)',
        gold: 'var(--accent-gold)',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
      },
      animation: {
        wiggle: 'wiggle 0.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
