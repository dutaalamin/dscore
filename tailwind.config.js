/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: '#09090b',
          dark: '#030303',
          light: '#18181b',
        },
        carbon: {
          DEFAULT: '#121214',
          light: '#1a1a1e',
          border: '#27272a',
        },
        volt: {
          DEFAULT: '#EAB308', // Premium warm gold (yellow-500)
          dark: '#CA8A04',
          glow: 'rgba(234, 179, 8, 0.08)',
        },
        court: {
          DEFAULT: '#10B981', // Clean emerald mint (emerald-500)
          dark: '#059669',
          glow: 'rgba(16, 185, 129, 0.08)',
        },
        accentRed: {
          DEFAULT: '#EF4444',
          glow: 'rgba(239, 68, 68, 0.08)',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
        pressStart: ['"Press Start 2P"', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounceSubtle 1s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.03)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        }
      }
    },
  },
  plugins: [],
}
