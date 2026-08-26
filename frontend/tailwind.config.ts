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
        bg: {
          DEFAULT: "#0d1117",
          subtle: "#161b22",
          surface: "#21262d",
        },
        border: {
          DEFAULT: "#30363d",
          subtle: "#21262d",
        },
        brand: {
          DEFAULT: "#3fb950",
          accent: "#58a6ff",
          warning: "#d29922",
          error: "#f85149",
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', "SFMono-Regular", "Consolas", "monospace"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
