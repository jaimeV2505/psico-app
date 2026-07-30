import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  "#f0f4fe",
          100: "#dde6fc",
          200: "#c3d3fa",
          300: "#9ab6f7",
          400: "#6a8ff2",
          500: "#4668eb",
          600: "#3049df",
          700: "#2838cc",
          800: "#2530a5",
          900: "#232e83",
          950: "#191f51",
        },
        sage: {
          50:  "#f4f7f4",
          100: "#e5ece4",
          200: "#ccdacb",
          300: "#a6bfa4",
          400: "#789d76",
          500: "#567f54",
          600: "#416341",
          700: "#354f35",
          800: "#2c402c",
          900: "#253525",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
