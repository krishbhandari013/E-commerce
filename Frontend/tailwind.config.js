/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        '4k': '2560px',   // Custom breakpoint for 2560px screens
      }
    },
  },
  plugins: [],
}