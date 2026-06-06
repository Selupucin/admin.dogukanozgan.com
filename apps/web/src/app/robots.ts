// robots.txt — otomatik üretim (docs/07 "robots.txt otomatik üretilir").
// Genel site (apps/web) indexlenir. Admin AYRI domainde olduğundan burada
// engellenmez; admin uygulaması kendi robots/noindex'ini taşır (docs/07 §Admin).

import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
