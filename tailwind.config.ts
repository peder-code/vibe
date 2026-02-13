import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        panel: 'rgba(255,255,255,0.06)',
        accent: '#4fd1ff'
      },
      backgroundImage: {
        cockpit: 'radial-gradient(circle at 20% 0%, #13233d 0%, #060b14 45%, #04070f 100%)'
      }
    }
  },
  plugins: []
};

export default config;
