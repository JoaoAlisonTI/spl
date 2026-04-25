/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1E6F5C',
        secondary: '#64748b',
        'bg-custom': '#edf1f5',
      },
      fontFamily: {
        primary: ['Arial', 'Helvetica', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
