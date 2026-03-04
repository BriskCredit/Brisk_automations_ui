/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#ea7100',
          600: '#d26500',
          700: '#ab5200',
          800: '#854000',
          900: '#5e2e00',
          950: '#3d1e00',
        },
        secondary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3a7cdd',
          600: '#3270c7',
          700: '#2a5ea6',
          800: '#224c85',
          900: '#1a3a64',
          950: '#112642',
        },
      },
    },
  },
  plugins: [],
}
