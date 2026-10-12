import type { Config } from "tailwindcss";

// Brand colours sampled from the Auctiva logo. `teal.DEFAULT` is the logo teal (decorative);
// `teal.deep` is the darker shade used behind white text so buttons pass WCAG AA (4.95:1).
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  future: { hoverOnlyWhenSupported: true }, // no sticky hover states on touch devices
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: "#17375E", dark: "#0F2744", soft: "#E8EEF5" },
        teal: { DEFAULT: "#22A9A9", deep: "#0E7C86", soft: "#E3F5F5" },
        ink: "#12263F",
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
