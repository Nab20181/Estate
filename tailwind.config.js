/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif'],
      },
      colors: {
        accent: '#0284c7',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
        sheet: '0 -4px 32px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
}
