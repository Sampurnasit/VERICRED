import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#080D1A',
        surface: {
          50: '#F8FAFC',
          100: '#1E293B',
          DEFAULT: '#0F172A',
          elevated: '#162036',
          border: '#1E2D4A',
        },
        brand: {
          blue: '#3B82F6',
          cyan: '#06B6D4',
          emerald: '#10B981',
          amber: '#F59E0B',
          coral: '#F43F5E',
          purple: '#8B5CF6',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-sm': '0 0 15px rgba(59, 130, 246, 0.25)',
        'glow-md': '0 0 25px rgba(59, 130, 246, 0.35)',
        'glow-cyan': '0 0 25px rgba(6, 182, 212, 0.35)',
        'glow-emerald': '0 0 25px rgba(16, 185, 129, 0.35)',
      },
    },
  },
  plugins: [],
};

export default config;
