import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        night: '#0a0a0f',
        blood: '#8b1a1a',
        gold: '#c9a84c',
        mist: '#3a3a4a',
        dawn: '#ff6b35',
        forest: '#1a3a1a',
      },
      fontFamily: {
        display: ['Cinzel', 'serif'],
        body: ['Crimson Text', 'serif'],
      },
      animation: {
        'flicker': 'flicker 3s infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-blood': 'pulse-blood 2s infinite',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
          '75%': { opacity: '0.9' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-blood': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(139, 26, 26, 0.7)' },
          '50%': { boxShadow: '0 0 0 15px rgba(139, 26, 26, 0)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
