/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(210, 70%, 50%)',
        accent: 'hsl(140, 60%, 45%)',
        surface: 'hsl(0, 0%, 100%)',
        bg: 'hsl(210, 36%, 96%)',
      },
      borderRadius: {
        'sm': '6px',
        'md': '10px',
        'lg': '16px',
      },
      spacing: {
        'sm': '8px',
        'md': '12px',
        'lg': '20px',
      },
      boxShadow: {
        'card': '0 4px 12px hsla(210, 36%, 70%, 0.1)',
      },
    },
  },
  plugins: [],
}