import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      globals: globals.node,
      ecmaVersion: "latest",
      sourceType: "module", // switch to "commonjs" if you use require/module.exports
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
    },
  },
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "generated/**",
      "prisma/generated/**",
    ],
  },
]);
