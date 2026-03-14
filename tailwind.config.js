/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'flip-in': 'flipIn 0.4s ease-out forwards',
        'fade-in': 'fadeIn 0.35s ease-out forwards',
      },
      keyframes: {
        flipIn: {
          '0%': { transform: 'scaleY(0.8)', opacity: '0.6' },
          '100%': { transform: 'scaleY(1)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
