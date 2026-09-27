/** @type {import('tailwindcss').Config} */

// Theme colors come from CSS variables in styles/globals.css, so each class
// below switches between light and dark mode on its own.
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: token('paper'),
        surface: token('surface'),
        line: token('line'),
        ink: token('ink'),
        muted: token('muted'),
        iris: token('iris'),
        'iris-soft': token('iris-soft'),
        'on-iris': token('on-iris'),
        blush: token('blush'),
        // Mood colors, from the lowest score (1, night) to the highest (5, sunrise)
        mood: {
          1: token('mood-1'),
          2: token('mood-2'),
          3: token('mood-3'),
          4: token('mood-4'),
          5: token('mood-5'),
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgb(var(--shadow) / 0.05), 0 12px 32px -16px rgb(var(--shadow) / 0.25)',
        glow: '0 10px 30px -10px rgb(var(--iris) / 0.7)',
      },
    },
  },
  plugins: [],
}
