/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        'pink1': '#edbbd1',
        'pink2': '#e79cbd',
        'blue1': '#4a7bd0',
        'blue2': '#355cd0',
        'blue3': '#2a4eb5',
      }
    }
  },
  plugins: []
};