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
        oneci: {
          green: {
            50: "#e8f5f2",
            100: "#c8e8e1",
            200: "#9fd4c7",
            300: "#6ebaa8",
            400: "#3d9c87",
            500: "#1b7d68",
            600: "#136957",
            700: "#0d5b4d", // Deep Emerald Forest Green (ONECI Header)
            800: "#0a493e",
            900: "#06362d",
          },
          orange: {
            50: "#fff6ed",
            100: "#ffebd5",
            200: "#ffd4aa",
            300: "#ffb474",
            400: "#ff8c3a",
            500: "#eb6a1d", // Vibrant Orange (ONECI Action / Badge)
            600: "#d95511",
            700: "#b43d0e",
            800: "#903213",
            900: "#762b13",
          },
          teal: {
            50: "#e0f7f5",
            100: "#b3ece5",
            200: "#80dfd3",
            300: "#4dd2c1",
            400: "#26c7b3",
            500: "#00a896", // Vibrant Teal (ONECI "Mon Timbre")
            600: "#009688",
            700: "#007d71",
            800: "#00645a",
            900: "#004740",
          },
        },
        primary: {
          50: "#e8f5f2",
          100: "#c8e8e1",
          200: "#9fd4c7",
          300: "#6ebaa8",
          400: "#3d9c87",
          500: "#00a896",
          600: "#0d5b4d",
          700: "#0a493e",
          800: "#06362d",
          900: "#03241e",
        },
      },
    },
  },
  plugins: [],
};

export default config;
