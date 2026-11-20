import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        navy: {
          950: "#050914",
          900: "#0a1124",
          850: "#0f172e",
          800: "#15213d",
          700: "#1e2f56",
        },
        charcoal: {
          950: "#0d0f12",
          900: "#13161c",
          850: "#1a1e27",
          800: "#242936",
          700: "#32394a",
        },
        gold: {
          300: "#fde68a",
          400: "#fcd34d",
          500: "#d4af37", // Metallic Gold clássico
          600: "#b8972e",
          700: "#927623",
        },
        orange: {
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
        },
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #d4af37 0%, #fcd34d 50%, #b8972e 100%)',
        'navy-gradient': 'linear-gradient(180deg, #0a1124 0%, #050914 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
