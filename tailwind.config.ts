import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          orange: '#F29222',
          'orange-dark': '#C47518',
          'orange-light': '#FFF4E8',
          brown: '#36271E',
          'brown-light': '#5C4A3E',
          cream: '#F7F4F0',
          'cream-dark': '#EDE8E2',
          border: '#E0D8CF',
          'bg-card': '#FFFFFF',
        },
      },
      boxShadow: {
        card: '0 1px 3px rgba(54,39,30,0.06), 0 4px 12px rgba(54,39,30,0.04)',
        'card-hover':
          '0 2px 6px rgba(54,39,30,0.08), 0 8px 24px rgba(54,39,30,0.06)',
        header: '0 2px 20px rgba(54,39,30,0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
