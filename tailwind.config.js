/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        // add: "rgba(0, 0, 0, 0.1) 0px 4px 12px",
        menu: "rgba(0, 0, 0, 0.1) 0px 0px 5px 0px, rgba(0, 0, 0, 0.1) 0px 0px 1px 0px",
        // card: "rgba(0, 0, 0, 0.15) 0px 2px 8px",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0)" },
          "100%": { transform: "scale(1)" },
        },
        pulse: {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.05)", opacity: "0.7" },
        },
      },
      animation: {
        fadeIn: "fadeIn 1s ease-in",
        scaleIn: "scaleIn 0.8s ease-out",
        pulse: "pulse 2s ease-in-out infinite",
      },
      backgroundImage: {
        "onboarding-gradient":
          "linear-gradient(to bottom right, #FAF6FF 0%, #C996E0 0%, #FFFFFF 75%)",
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
};
