module.exports = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontSize: {
        base: '0.875rem',
      },
      keyframes: ({theme}) => ({
        ellipsis: {
          "to": { width: "1.25em"}
        },
      }),
      animation: {
        ellipsis: "ellipsis steps(4, end) 900ms infinite"
      }
    },
  },
  plugins: [],
};
