import { baseConfig } from "./base.js";
import globals from "globals";

/**
 * Next.js app'leri için ESLint yapılandırması (K24).
 * Taban yapılandırmayı genişletir; tarayıcı global'lerini ekler.
 *
 * Not: `next/core-web-vitals` eslint-config-next aracılığıyla her app'in
 * kendi eslint.config.mjs dosyasında FlatCompat ile dahil edilir; burada
 * yalnızca framework-bağımsız ortak temel tutulur.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const nextConfig = [
  ...baseConfig,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
];

export default nextConfig;
