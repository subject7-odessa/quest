import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        void: "#060b14",
        panel: "#0c1826",
        panel2: "#101f30",
        line: "#1c3a52",
        cyan: "#4dd8e8",
        teal: "#2dd4a8",
        gold: "#e0b84f",
        slate: "#8b98ab",
        bronze: "#b8834a",
        violet: "#b088e8",
        danger: "#e0667a",
      },
      fontFamily: {
        display: ["var(--font-orbitron)"],
        body: ["var(--font-rajdhani)"],
      },
      boxShadow: {
        glow: "0 0 30px rgba(77,216,232,0.25)",
      },
    },
  },
  plugins: [],
};
export default config;
