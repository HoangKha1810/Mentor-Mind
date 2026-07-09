import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#07111F',
        surface: '#0B1628',
        surfaceLight: '#111E33',
        primary: '#6D5DFE',
        secondary: '#00D4FF',
        success: '#57B846',
        warning: '#F59E0B',
        danger: '#EF4444',
        mutedText: '#94A3B8',
      },
      boxShadow: {
        glow: '0 0 60px rgba(0, 212, 255, 0.18)',
        soft: '0 18px 55px rgba(15, 23, 42, 0.18)',
      },
      fontFamily: {
        sans: ['Poppins', 'var(--font-geist-sans)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'Poppins', 'var(--font-geist-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
