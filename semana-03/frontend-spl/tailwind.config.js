/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'bg-[#2e7d55]',
    'border-[#2e7d55]',
    'bg-white',
    'border-gray-200',
    'opacity-100',
    'opacity-0',
    'line-through',
    'text-gray-500'
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
