import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        royal: {
          maroon: "#800020",
          "maroon-light": "#A00028",
          "maroon-dark": "#600018",
          gold: "#D4AF37",
          "gold-light": "#E8C84A",
          "gold-dark": "#B8960F",
          cream: "#FFFDD0",
          "cream-dark": "#F5E6C8",
          ivory: "#FFFFF0",
          burgundy: "#4A0011",
        },
      },
      fontFamily: {
        heading: ["Playfair Display", "Georgia", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "royal-pattern": "url('/pattern.png')",
        "gold-gradient": "linear-gradient(135deg, #D4AF37, #FFFDD0, #D4AF37)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        shimmer: "shimmer 2s infinite",
        "gold-glow": "goldGlow 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        goldGlow: {
          "0%, 100%": { boxShadow: "0 0 5px rgba(212, 175, 55, 0.5)" },
          "50%": { boxShadow: "0 0 20px rgba(212, 175, 55, 0.8)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
