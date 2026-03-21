export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        olive: {
          50: '#f4f5f0',
          100: '#e1e4d1',
          500: '#808000',
          600: '#6b6b00',
          700: '#555500',
          800: '#3d3d00',
        },
        alabaster: '#fdfdfb',
      },
      animation: {
        'fluid-drift': 'fluid-drift 20s ease-in-out infinite',
      },
      keyframes: {
        'fluid-drift': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
        }
      }
    },
  },
  plugins: [],
};
