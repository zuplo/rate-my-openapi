import { fontFamily } from "tailwindcss/defaultTheme";

export const content = [
  "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
];
export const theme = {
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
      sans: ["var(--font-roboto)", ...fontFamily.sans],
      "roboto-mono": ["var(--font-roboto-mono)", ...fontFamily.sans],
      "plex-sans": ["var(--font-plex-sans)", ...fontFamily.sans],
    },
    fontSize: {
      base: "0.875rem",
    },
    backgroundImage: {
      "gradient-radial":
        "radial-gradient(circle at 25% -10%, var(--tw-gradient-from), transparent 45%), radial-gradient(circle at 110% 75%, var(--tw-gradient-from), transparent 55%)",
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export const plugins = [];
