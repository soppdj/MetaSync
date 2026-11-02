/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Soft Futuristic Core Palette (Cyan / Teal / Ocean Hologram)
        brand: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4', // Neon Cyan
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        // Cyber Solar / Copper Accent (From the HUD image)
        copper: {
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316', // Glowing solar orange
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        meta: {
          blue: '#0081FB',
          purple: '#8A2BE2',
          cyan: '#00F0FF',
        },
        // Deep Space Cyber Deck (Soft obsidian & midnight navy)
        dark: {
          950: '#06090f', // Deepest background
          900: '#0a0f18', // Card background
          850: '#0f1726', // Elevated surface
          800: '#142033', // Sub-card / hover
          750: '#1a2942', // Border / separator
          700: '#243755', // High-contrast border
          600: '#334d75',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -3px rgba(0, 240, 255, 0.25)',
        'glow-teal': '0 0 20px -3px rgba(6, 182, 212, 0.25)',
        'glow-copper': '0 0 20px -3px rgba(249, 115, 22, 0.25)',
        'glow-rose': '0 0 20px -3px rgba(244, 63, 94, 0.25)',
        'glow-blue': '0 0 20px -3px rgba(0, 129, 251, 0.25)',
        'glow-purple': '0 0 20px -3px rgba(138, 43, 226, 0.25)',
        'hud-panel': 'inset 0 1px 0 0 rgba(0, 240, 255, 0.1), 0 10px 30px -10px rgba(6, 9, 15, 0.8)',
      }
    },
  },
  plugins: [],
}
