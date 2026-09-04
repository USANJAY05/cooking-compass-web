/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: { ink: '#172019', sage: '#7f927d', cream: '#f7f5ef', moss: '#3d513f' },
      fontFamily: { sans: ['DM Sans', 'sans-serif'], display: ['Playfair Display', 'serif'] },
    },
  },
  plugins: [],
}
