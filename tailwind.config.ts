import type { Config } from 'tailwindcss';

const c = (name: string) => `rgb(var(--color-${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: c('paper'),
        ink: c('ink'),
        dim: c('dim'),
        rule: c('rule'),
        sheet: c('sheet'),
        highlight: c('highlight'),
        accent: c('accent'),
      },
      fontFamily: {
        serif: ['"Iowan Old Style"', 'Charter', 'Cambria', 'Georgia', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['ui-monospace', '"JetBrains Mono"', '"SF Mono"', 'Consolas', 'monospace'],
      },
      letterSpacing: {
        wider: '.14em',
        widest: '.2em',
      },
    },
  },
  plugins: [],
};

export default config;
