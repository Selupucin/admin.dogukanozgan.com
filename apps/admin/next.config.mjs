import createNextIntlPlugin from "next-intl/plugin";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Admin'de locale-prefixed rota YOK (bkz. docs/01 admin route yapısı). next-intl
// yalnızca UI string yönetimi için kullanılır; request config sabit locale döner.
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Güvenlik HTTP başlıkları (docs/13 K1). Admin daha KATI: clickjacking tamamen kapalı
// (DENY + frame-ancestors 'none'), arama motorlarına kapalı (noindex başlığı da).
//
// CSP fetch-direktifleri ZORLANIR. Admin'de inline script yok, fontlar next/font ile
// self-host, görseller same-origin auth-gated proxy (/dosya) üzerinden blob:/data: →
// 'self' yeterlidir. style-src'de 'unsafe-inline' Tailwind/Next runtime stilleri için
// kalır (Next bu noktada style nonce zorlamaz). img-src'de data:/blob: önizleme/proxy için.
// TODO(doc): Nonce tabanlı script-src CSP ileride (docs/13 K1 takip).
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Content-Security-Policy",
    value: csp,
  },
  { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@do/ui", "@do/products", "@do/db", "@do/email"],
  // pnpm monorepo'da Prisma query engine'i serverless fonksiyona kopyalanabilsin diye
  // dosya-izleme kökü monorepo köküne; @prisma/client harici (node_modules'tan yüklenir).
  outputFileTracingRoot: path.join(__dirname, "../../"),
  webpack: (config, { isServer }) => {
    // pnpm monorepo'da Prisma query engine'ini server bundle'ına kopyalar (resmi çözüm).
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()];
    }
    return config;
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);
