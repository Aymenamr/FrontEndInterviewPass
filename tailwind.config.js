/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-teal': '#32B599'
      }
    },
  },
  plugins: [require('tailwindcss-primeui')],
}