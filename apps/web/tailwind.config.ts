import defaultTheme from "tailwindcss/defaultTheme";

module.exports = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      md: "768px",
      lg: "1112px",
    },
    fontWeight: {
      normal: "400",
      medium: "500",
      bold: "700",
      extrabold: "900",
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-roboto)", ...defaultTheme.fontFamily.sans],
        "roboto-mono": [
          "var(--font-roboto-mono)",
          ...defaultTheme.fontFamily.sans,
        ],
        "plex-sans": ["var(--font-plex-sans)", ...defaultTheme.fontFamily.sans],
      },
      fontSize: {
        base: "0.875rem",
      },
      keyframes: () => ({
        ellipsis: {
          to: { width: "1.25em" },
        },
      }),
      animation: {
        ellipsis: "ellipsis steps(4, end) 900ms infinite",
      },
      colors: {
        "critical-dark": "black",
        "critical-light": "white",
        "high-dark": "#A00077",
        "high-light": "#FF00BD",
        "mid-dark": "#F17E1F",
        "mid-light": "#FFDB61",
        "low-dark": "#538501",
        "low-light": "#80CF00",
      },
    },
  },
  plugins: [],
};