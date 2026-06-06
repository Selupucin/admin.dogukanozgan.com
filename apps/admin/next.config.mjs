import createNextIntlPlugin from "next-intl/plugin";

// Admin'de locale-prefixed rota YOK (bkz. docs/01 admin route yapısı). next-intl
// yalnızca UI string yönetimi için kullanılır; request config sabit locale döner.
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@do/ui", "@do/products", "@do/db"],
};

export default withNextIntl(nextConfig);
