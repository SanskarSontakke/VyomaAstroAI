/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Cinzel', 'serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      },
      colors: {
        blue: {
          500: '#3b82f6',
          600: '#2563eb',
        }
      }
    },
  },
  plugins: [],
}
