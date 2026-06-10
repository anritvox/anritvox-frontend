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
    
        white: "#111D15", 
        
        slate: {
          50: '#111D15',  // Inverted text color map (Deep Forest Obsidian)
          100: '#16251A', // Dark emerald-charcoal
          200: '#1B2E21', // Dark moss contrast
          300: '#223A2B', // Main text contrast body (Replaces text-slate-300 with readable tone)
          400: '#2D4B39', // Subheading / descriptive text contrast (Replaces text-slate-400)
          500: '#3D614A', // Muted metadata context labels (Replaces text-slate-500)
          600: '#547D63', // Neutral green borders
          700: '#DDE2D5', // Accent light boundaries
          800: '#EBEDF3', 
          900: '#F4F6F0',
          950: '#FDFDFB', 
        },

        // Premium Branding Color Schemes
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
          dim: '#f9f9f6',
          dark: '#f3f4ee'
        },
        ivory: '#fefcf7',
      },
      boxShadow: {
        'premium-blur': '0 8px 32px 0 rgba(115, 131, 74, 0.04)',
        'soft-glow': '0 0 25px -5px rgba(61, 97, 74, 0.1)',
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
