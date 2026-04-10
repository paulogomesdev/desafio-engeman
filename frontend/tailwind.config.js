/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1440px',
      },
    },
    extend: {
      fontFamily: {
        jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
      },
      colors: {
        brand: {
          primary: '#2563eb',
          secondary: '#0f172a',
          slate: '#020617',
        }
      }
    },
  },
  plugins: [],
}
