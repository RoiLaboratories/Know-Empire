/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0)' },
          '100%': { transform: 'scale(1)' },
        },
        pulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.7' },
        }
      },
      animation: {
        fadeIn: 'fadeIn 1s ease-in',
        scaleIn: 'scaleIn 0.8s ease-out',
        pulse: 'pulse 2s ease-in-out infinite',
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
};
