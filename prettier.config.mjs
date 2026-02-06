/** @type {import('prettier').Config} */
const config = {
  plugins: ["prettier-plugin-tailwindcss", "prettier-plugin-packagejson"],
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  bracketSpacing: true,
  arrowParens: "always",
  endOfLine: "lf",
  overrides: [
    {
      files: "package.json",
      options: {
        parser: "json-stringify",
      },
    },
  ],
};

export default config;
