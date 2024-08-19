import {nextui} from "@nextui-org/react";
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "slate-700": "#1e293b",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "start-page":"url('src/images/startPage.jpg')"
      },
    },
    colors: {
      "white" : "#f2f7fd",
      "slate-700": "#1e293b",
      "logo":"#c3daf4",
      "default-cl": "#2d7fd1",
      "policy-link": "#9ca3af",
    },
    fontFamily: {
      "console": ["'Montserrat'", "sans-serif"],
    },
  },
  darkMode: "class",
  plugins: [nextui()],
};
export default config;
