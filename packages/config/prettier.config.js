/**
 * Paylaşımlı Prettier yapılandırması (K24).
 * Tüm app ve paketler bu dosyayı kök prettier config olarak kullanır.
 *
 * @type {import("prettier").Config}
 */
const config = {
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  endOfLine: "lf",
};

export default config;
