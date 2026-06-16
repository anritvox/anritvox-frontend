export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/pages/admin/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        olive: {
          50: '#f4f7f4',
          100: '#e6ede6',
          200: '#cfddcf',
          300: '#a9c2a9',
          400: '#7ca17c',
          500: '#5b835b',
          600: '#466746',
          700: '#3a533a',
          800: '#304430',
          900: '#293a29',
          950: '#141f14',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        fadeIn: 'fadeIn 0.4s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
