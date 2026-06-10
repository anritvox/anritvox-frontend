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
        // Deep Organic Earth Green Design System
        olive: {
          50: '#f7f8f4',
          100: '#ebedd9',
          200: '#d5dbb5',
          300: '#b4c08b',
          400: '#91a164', 
          500: '#73834a', // Core luxury brand focus tone
          600: '#596737',
          700: '#444f2b',
          800: '#343c22',
          900: '#2c331d',
          950: '#171c0e',
        },
        // Premium Off-White & Organic Stone Textures
        alabaster: {
          DEFAULT: '#fdfdfb',
          dim: '#f9f9f6',
          dark: '#f3f4ee'
        },
        ivory: '#fefcf7',
        
        // Comprehensive mapping overrides to completely synchronize the whole site design ecosystem
        emerald: {
          50: '#f7f8f4', 100: '#ebedd9', 200: '#d5dbb5', 300: '#b4c08b', 400: '#91a164',
          500: '#73834a', 600: '#596737', 700: '#444f2b', 800: '#343c22', 900: '#2c331d', 950: '#171c0e'
        },
        green: {
          50: '#f7f8f4', 100: '#ebedd9', 200: '#d5dbb5', 300: '#b4c08b', 400: '#91a164',
          500: '#73834a', 600: '#596737', 700: '#444f2b', 800: '#343c22', 900: '#2c331d', 950: '#171c0e'
        },
        indigo: {
          50: '#f7f8f4', 100: '#ebedd9', 200: '#d5dbb5', 300: '#b4c08b', 400: '#91a164',
          500: '#73834a', 600: '#596737', 700: '#444f2b', 800: '#343c22', 900: '#2c331d', 950: '#171c0e'
        },
        blue: {
          50: '#f7f8f4', 100: '#ebedd9', 200: '#d5dbb5', 300: '#b4c08b', 400: '#91a164',
          500: '#73834a', 600: '#596737', 700: '#444f2b', 800: '#343c22', 900: '#2c331d', 950: '#171c0e'
        },
        purple: {
          50: '#f7f8f4', 100: '#ebedd9', 200: '#d5dbb5', 300: '#b4c08b', 400: '#91a164',
          500: '#73834a', 600: '#596737', 700: '#444f2b', 800: '#343c22', 900: '#2c331d', 950: '#171c0e'
        },
        cyan: {
          50: '#f7f8f4', 100: '#ebedd9', 200: '#d5dbb5', 300: '#b4c08b', 400: '#91a164',
          500: '#73834a', 600: '#596737', 700: '#444f2b', 800: '#343c22', 900: '#2c331d', 950: '#171c0e'
        },
        teal: {
          50: '#f7f8f4', 100: '#ebedd9', 200: '#d5dbb5', 300: '#b4c08b', 400: '#91a164',
          500: '#73834a', 600: '#596737', 700: '#444f2b', 800: '#343c22', 900: '#2c331d', 950: '#171c0e'
        },
        slate: {
          50: '#fdfdfb', 100: '#f9f9f6', 200: '#f3f4ee', 300: '#ebedd9', 400: '#d5dbb5',
          500: '#b4c08b', 600: '#91a164', 700: '#73834a', 800: '#596737', 900: '#343c22', 950: '#171c0e'
        }
      },
      boxShadow: {
        'premium-blur': '0 8px 32px 0 rgba(115, 131, 74, 0.04)',
        'soft-glow': '0 0 25px -5px rgba(145, 161, 100, 0.2)',
      },
      animation: {
        'fluid-drift': 'fluid-drift 22s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        'fluid-drift': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(25px, -40px) scale(1.06)' },
          '66%': { transform: 'translate(-15px, 15px) scale(0.95)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
};
