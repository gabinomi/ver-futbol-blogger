import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        barlow: ['"Barlow Condensed"', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        dark: {
          900: '#060d1a',
          800: '#08102400',
          700: '#0d1829',
        },
        brand: {
          red: '#dc2626',
          blue: '#2563eb',
          tg: '#29b6f6',
        },
      },
      animation: {
        'pulse-red': 'pulseRed 2s ease-in-out infinite',
        'blink': 'blink 1s infinite',
        'shine': 'shine 3.5s ease-in-out infinite',
      },
      keyframes: {
        pulseRed: {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(220,38,38,0.5)' },
          '50%': { boxShadow: '0 0 0 9px rgba(220,38,38,0)' },
        },
        blink: {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0.2' },
        },
        shine: {
          '0%': { left: '-120%' },
          '25%': { left: '130%' },
          '100%': { left: '130%' },
        },
      },
    },
  },
  plugins: [],
}
export default config
