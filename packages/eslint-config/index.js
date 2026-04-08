import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import tseslint from "typescript-eslint";

export const baseConfig = [
  { ignores: ["dist", ".next", "node_modules"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
      prettier: prettierPlugin,
    },
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      "no-var": "error",
      "no-unused-vars": "off", // typescript-eslint로 검사하므로 중복 방지
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-empty-object-type": "off",
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "prettier/prettier": ["error", { endOfLine: "lf" }],
    },
  },
];

export default baseConfig;
