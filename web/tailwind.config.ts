import type { Config } from "tailwindcss";

// Brand colours sampled from the Auctiva logo. `teal.DEFAULT` is the logo teal (decorative);
// `teal.deep` is the darker shade used behind white text so buttons pass WCAG AA (4.95:1).
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  future: { hoverOnlyWhenSupported: true }, // no sticky hover states on touch devices
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--color-background) / <alpha-value>)",
        surface: {
          DEFAULT: "rgb(var(--color-surface) / <alpha-value>)",
          raised: "rgb(var(--color-surface-raised) / <alpha-value>)",
          muted: "rgb(var(--color-surface-muted) / <alpha-value>)",
        },
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        action: {
          DEFAULT: "rgb(var(--color-action) / <alpha-value>)",
          hover: "rgb(var(--color-action-hover) / <alpha-value>)",
          text: "rgb(var(--color-action-text) / <alpha-value>)",
        },
        navy: {
          DEFAULT: "rgb(var(--color-navy) / <alpha-value>)",
          dark: "rgb(var(--color-navy-dark) / <alpha-value>)",
          soft: "rgb(var(--color-navy-soft) / <alpha-value>)",
        },
        teal: {
          DEFAULT: "#22A9A9",
          deep: "rgb(var(--color-teal-deep) / <alpha-value>)",
          soft: "rgb(var(--color-teal-soft) / <alpha-value>)",
        },
        ink: "rgb(var(--color-ink) / <alpha-value>)",
      },
      fontFamily: {
        sans: ['"Inter Variable"', "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        display: ['"Montserrat Variable"', '"Inter Variable"', "system-ui", "sans-serif"],
      },
      boxShadow: { card: "0 1px 2px rgba(23,55,94,.06), 0 8px 24px -12px rgba(23,55,94,.18)" },
    },
  },
  plugins: [],
};
export default config;
