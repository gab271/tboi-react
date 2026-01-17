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
        'text-ink': 'var(--text-ink)',
        'text-heading': 'var(--text-heading)',
        'text-dim': 'var(--text-dim)',
        'accent-blood': 'var(--accent-blood)',
        'accent-gold': 'var(--accent-gold)',
        'accent-blue': 'var(--accent-blue)',
        
        // Semantic Token Mapping for compatibility
        border: "var(--border-ink)",
        input: "var(--bg-paper-dark)",
        ring: "var(--accent-gold)",
        background: "var(--bg-paper)",
        foreground: "var(--text-ink)",
        
        bg: {
          0: 'var(--bg-floor)',
          1: 'var(--bg-paper)',
          2: 'var(--bg-paper-dark)',
        },
        fg: 'var(--text-ink)',
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
    },
  },
  plugins: [],
}
