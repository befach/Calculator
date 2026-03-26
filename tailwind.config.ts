import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#F29222',
          'orange-dark': '#C47518',
          brown: '#36271E',
          'bg-light': '#F4F4F4',
          'bg-card': '#F5F5F5',
          border: '#E0E0E0',
        },
      },
    },
  },
  plugins: [],
};

export default config;
