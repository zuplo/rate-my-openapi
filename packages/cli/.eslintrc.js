/**@type {import('eslint').Linter.Config} */
// eslint-disable-next-line no-undef
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.eslint.json",
  },
  plugins: ["@typescript-eslint", "import", "node", "unicorn"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  rules: {
    "no-console": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "node/no-process-env": "error",
    "@typescript-eslint/no-floating-promises": "error",
    "unicorn/prefer-node-protocol": "error",
    "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
    "@typescript-eslint/naming-convention": [
      "error",
      {
        selector: ["class"],
        format: ["PascalCase"],
      },
      {
        selector: "interface",
        format: ["PascalCase"],
        custom: {
          regex: "^I[A-Z]",
          match: false,
        },
      },
    ],
  },
};
