import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        nulo: {
          primary: "#FF6600",
          "primary-mid": "#EA580C",
          "primary-dark": "#C2410C",
          "primary-light": "#F97316",
          accent: "#F59E0B",
          "soft-orange": "#FFF7ED",
          text: "#0F172A",
          "text-secondary": "#334155",
          "text-muted": "#475569",
          background: "#FFFFFF",
          card: "#FFFFFF",
          border: "#E2E8F0",
          ivory: "oklch(0.98 0.01 75)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
