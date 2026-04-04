/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0d3b66', // deep navy
          light: '#204d7a',
          dark: '#0a2a4d'
        },
        accent: {
          teal: '#008080',
          gold: '#b8860b'
        },
        card: '#f7f9fc',
        background: '#ffffff',
        text: '#1a202c'
      },
      borderRadius: {
        'lg': '0.75rem',
        'xl': '1rem'
      }
    },
  },
  plugins: [require('@tailwindcss/forms')],
};