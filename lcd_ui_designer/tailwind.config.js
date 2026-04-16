/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        panel: '#121723',
        panelAlt: '#171d2b',
        accent: '#4f8cff'
      }
    }
  },
  plugins: [],
};
