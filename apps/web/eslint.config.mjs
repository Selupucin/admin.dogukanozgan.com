import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import { nextConfig } from "@do/config/eslint/next";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const config = [
  ...nextConfig,
  ...compat.extends("next/core-web-vitals"),
  {
    ignores: [".next/**", "node_modules/**"],
  },
];

export default config;
