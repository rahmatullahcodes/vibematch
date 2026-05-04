/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        coral: "#ff6b5f",
        ember: "#f97316",
        aqua: "#14b8a6",
        slateDeep: "#0f172a",
      },
      fontFamily: {
        heading: ["Sora", "sans-serif"],
        body: ["Plus Jakarta Sans", "sans-serif"],
      },
      boxShadow: {
        glow: "0 20px 55px -22px rgba(255, 107, 95, 0.6)",
        soft: "0 24px 60px -28px rgba(15, 23, 42, 0.4)",
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-7px)" },
        },
      },
      animation: {
        rise: "rise 700ms ease-out both",
        floaty: "floaty 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
