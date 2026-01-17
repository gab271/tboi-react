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
        heading: ['"Press Start 2P"', 'cursive'], // Emulating Upheaval
        pixel: ['"VT323"', 'monospace'],
        sans: ['"VT323"', 'monospace'], // Default to pixel font
      },
      colors: {
        border: "var(--border)",
        input: "var(--bg-2)",
        ring: "var(--ring)",
        background: "var(--bg-0)",
        foreground: "var(--fg)",
        
        // Semantic Token Mapping
        bg: {
          0: 'var(--bg-0)',
          1: 'var(--bg-1)',
          2: 'var(--bg-2)',
        },
        fg: 'var(--fg)',
        muted: {
          DEFAULT: 'var(--muted)',
          2: 'var(--muted-2)',
          foreground: 'var(--muted-2)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--fg)',
        },
        card: {
          DEFAULT: 'var(--bg-1)',
          foreground: 'var(--fg)',
        },
        
        // Accents
        blood: 'var(--blood)',
        gold: 'var(--gold)',
        moss: 'var(--moss)',
        tear: 'var(--tear)',
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
      },
      fontFamily: {
        serif: ["'Cinzel'", "'Georgia'", "serif"],
        sans: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
}
