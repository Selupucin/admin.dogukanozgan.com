import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";

/**
 * Paylaşımlı ESLint taban yapılandırması (flat config, ESLint 9 — K24).
 * TypeScript projeleri için ortak kurallar. Next.js'e özgü kurallar için
 * ./next.js dosyasına bakınız.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const baseConfig = [
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/build/**",
      "**/.turbo/**",
      "**/coverage/**",
      "**/generated/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  eslintConfigPrettier,
];

export default baseConfig;
