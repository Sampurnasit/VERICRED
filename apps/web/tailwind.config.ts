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
        background: '#0B1226',
        surface: {
          DEFAULT: '#141F39',
          elevated: '#1A2A48',
          border: '#24365D',
        },
        brand: {
          blue: '#458BFF',
          cyan: '#45D7E0',
          emerald: '#4AD2A0',
          amber: '#FFB800',
          coral: '#FF707D',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
