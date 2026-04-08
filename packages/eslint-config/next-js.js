import reactPlugin from "eslint-plugin-react";

import { baseConfig } from "./index.js";

export default [
  ...baseConfig,
  {
    plugins: { react: reactPlugin },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      // Next.js Server Component에서 async 함수 허용
      "@typescript-eslint/require-await": "off",
    },
  },
];
