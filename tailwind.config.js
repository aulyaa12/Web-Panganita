/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        panganita: {
          50: "#F0F8F1",
          100: "#E1F0E3",
          500: "#438B59",
          600: "#347849",
          700: "#285F3A",
          800: "#244832",
        },
      },
    },
  },
  plugins: [],
};
