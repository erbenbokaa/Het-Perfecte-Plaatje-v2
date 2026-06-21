import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sand: "#f5efe6",
        ocean: "#0f766e",
        sunset: "#f97316",
      },
    },
  },
  plugins: [],
};

export default config;
