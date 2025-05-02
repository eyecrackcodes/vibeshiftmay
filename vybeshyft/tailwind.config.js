/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#4da6ff',
          DEFAULT: '#1a8cff',
          dark: '#0066cc',
        },
        secondary: {
          light: '#a3e635',
          DEFAULT: '#84cc16',
          dark: '#65a30d',
        },
        accent: {
          light: '#93c5fd',
          DEFAULT: '#60a5fa',
          dark: '#3b82f6',
        },
      },
    },
  },
  plugins: [],
} 