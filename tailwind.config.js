/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/pages/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        white: "#0f1612",
        slate: {
          50: '#0f1612',
          100: '#141f19',
          200: '#1a2920',
          300: '#22362a',
          400: '#2c4535',
          500: '#3d5e4a',
          600: '#527a61',
          700: '#cfd6c8',
          800: '#eef1ea',
          900: '#f4f6f0',
          950: '#fdfdfb',
        },
        olive: {
          50: '#f7f8f4',
          100: '#ebedd9',
          200: '#d5dbb5',
          300: '#b4c08b',
          400: '#91a164',
          500: '#73834a',
          600: '#596737',
          700: '#444f2b',
          800: '#343c22',
          900: '#2c331d',
          950: '#171c0e',
        },
        emerald: {
          50: '#f7f8f4', 100: '#ebedd9', 200: '#d5dbb5', 300: '#b4c08b', 400: '#73834a',
          500: '#596737', 600: '#444f2b', 700: '#343c22', 800: '#2c331d', 900: '#171c0e', 950: '#0b0f08'
        },
        green: {
          50: '#f7f8f4', 100: '#ebedd9', 200: '#d5dbb5', 300: '#b4c08b', 400: '#73834a',
          500: '#596737', 600: '#444f2b', 700: '#343c22', 800: '#2c331d', 900: '#171c0e', 950: '#0b0f08'
        },
        indigo: {
          50: '#f7f8f4', 100: '#ebedd9', 200: '#d5dbb5', 300: '#b4c08b', 400: '#73834a',
          500: '#596737', 600: '#444f2b', 700: '#343c22', 800: '#2c331d', 900: '#171c0e', 950: '#0b0f08'
        },
        blue: {
          50: '#f7f8f4', 100: '#ebedd9', 200: '#d5dbb5', 300: '#b4c08b', 400: '#73834a',
          500: '#596737', 600: '#444f2b', 700: '#343c22', 800: '#2c331d', 900: '#171c0e', 950: '#0b0f08'
        },
        purple: {
          50: '#f7f8f4', 100: '#ebedd9', 200: '#d5dbb5', 300: '#b4c08b', 400: '#73834a',
          500: '#596737', 600: '#444f2b', 700: '#343c22', 800: '#2c331d', 900: '#171c0e', 950: '#0b0f08'
        },
        cyan: {
          50: '#f7f8f4', 100: '#ebedd9', 200: '#d5dbb5', 300: '#b4c08b', 400: '#73834a',
          500: '#596737', 600: '#444f2b', 700: '#343c22', 800: '#2c331d', 900: '#171c0e', 950: '#0b0f08'
        },
        teal: {
          50: '#f7f8f4', 100: '#ebedd9', 200: '#d5dbb5', 300: '#b4c08b', 400: '#73834a',
          500: '#596737', 600: '#444f2b', 700: '#343c22', 800: '#2c331d', 900: '#171c0e', 950: '#0b0f08'
        },
        alabaster: {
          DEFAULT: '#fdfdfb',
          dim: '#f4f6f0',
          dark: '#ebedf3'
        },
        ivory: '#fefcf7',
      },
      boxShadow: {
        'premium-blur': '0 8px 32px 0 rgba(115, 131, 74, 0.04)',
        'soft-glow': '0 0 25px -5px rgba(34, 54, 42, 0.12)',
      },
      animation: {
        'fluid-drift': 'fluid-drift 26s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        'fluid-drift': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '33%': { transform: 'translate3d(20px, -35px, 0) scale(1.05)' },
          '66%': { transform: 'translate3d(-10px, 10px, 0) scale(0.97)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
};
