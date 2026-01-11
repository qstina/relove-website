import type { Config } from "tailwindcss";

const config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FFFDD0",
        brown: "#8B5E3C",
      },
      fontFamily: {
        futura: ["Futura", "sans-serif"],
        "times-condensed": ['"Times New Roman MT Condensed"', "serif"],
      },
    },
  },
} satisfies Config;

export default config;
