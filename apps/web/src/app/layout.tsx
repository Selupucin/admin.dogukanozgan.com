import type { ReactNode } from "react";
import type { Metadata } from "next";
import { siteUrl } from "@/lib/site";

// Kök metadata: metadataBase tüm OG/Twitter görsel URL'lerini mutlak hale getirir
// (docs/07 SEO). Locale-bazlı başlık/açıklama [locale]/layout.tsx'te tanımlanır.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
};

// Kök layout: locale-bağımsız. Gerçek <html> ve gövde [locale]/layout.tsx'te
// kurulur (next-intl App Router deseni). Burası yalnızca children'ı geçirir.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
