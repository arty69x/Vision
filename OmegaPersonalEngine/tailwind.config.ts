import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./agents/**/*.{ts,tsx}", "./core/**/*.{ts,tsx}"]
};

export default config;
