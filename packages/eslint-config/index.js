import path from "node:path";
import { fileURLToPath } from "node:url";

import { fixupPluginRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";

import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import _import from "eslint-plugin-import";
import prettier from "eslint-plugin-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  { ignores: ["dist"] },
  js.configs.recommended,
  ...compat.extends("prettier", "plugin:prettier/recommended"),
  {
    plugins: {
      "@typescript-eslint": typescriptEslint,
      import: fixupPluginRules(_import),
      "simple-import-sort": simpleImportSort,
      prettier,
      react: pluginReact,
    },
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      "@typescript-eslint/no-empty-object-type": "off", // {} 빈 객체 사용 가능
      "react/react-in-jsx-scope": "off", // React를 import하지 않아도 사용 가능
      "simple-import-sort/imports": "error", // import exports 정렬
      "simple-import-sort/exports": "error",
      "prettier/prettier": [
        // prettier 설정
        "error",
        {
          endOfLine: "lf",
        },
      ],
      "no-var": "error", // var 사용 금지
      "no-unused-vars": "off", // 아래 typescript 로 검사하므로 충돌하지 않도록 설정 해제
      "@typescript-eslint/no-unused-vars": "error", // 사용하지 않는 변수는 경고
    },
  },
  ...tseslint.configs.recommended,
];
