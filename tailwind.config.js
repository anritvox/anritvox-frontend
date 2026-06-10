/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "var(--color-primary)",
          "primary-hover": "var(--color-primary-hover)",
          accent: "var(--color-accent)",
          text: "var(--color-text-main)",
          muted: "var(--color-text-muted)",
        },
        offwhite: {
          bg: "var(--color-offwhite-bg)",
          surface: "var(--color-offwhite-surface)",
        }
      },
      backgroundColor: {
        global: "var(--color-offwhite-bg)",
        surface: "var(--color-offwhite-surface)",
      }
    },
  },
  plugins: [],
}
