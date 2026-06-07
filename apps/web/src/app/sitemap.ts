// sitemap.xml — otomatik üretim (docs/07 "sitemap.xml otomatik üretilir").
// TR + EN tüm genel sayfalar + ürün sayfaları. Her giriş YEREL yolu (next-intl
// pathnames + ürün slugs.en) ve doğru hreflang alternates'ini içerir.
// Admin/yasal-olmayan kişisel veri sayfaları yok (admin ayrı domainde, noindex).

import type { MetadataRoute } from "next";
import { getAllProducts } from "@do/products";
import { getPathname } from "@/i18n/navigation";
import { routing, type Locale, type AppPathname, type StaticPathname } from "@/i18n/routing";
import { siteUrl } from "@/lib/site";

// Sabit (statik) genel sayfaların KANONİK pathname anahtarları (docs/02 yol tablosu).
const staticPaths: AppPathname[] = [
  "/", // anasayfa
  "/planlar",
  "/hakkimda",
  "/iletisim",
  "/teklif-durumu",
  "/sss",
  "/kvkk",
  "/gizlilik",
  "/cerez-politikasi",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const products = getAllProducts();
  const entries: MetadataRoute.Sitemap = [];

  // Bir kanonik pathname (+ locale-bazlı param) için tüm locale girişlerini ekler.
  const addEntry = (
    pathname: AppPathname,
    priority: number,
    paramsByLocale?: Partial<Record<Locale, Record<string, string>>>,
  ) => {
    const url = (locale: Locale) => {
      // Dinamik ürün rotaları ([slug]=tanım, [slug]/teklif=teklif) için
      // {pathname, params}; diğerleri STATİK yol. docs/02/03.
      const isDynamic = pathname === "/planlar/[slug]" || pathname === "/planlar/[slug]/teklif";
      const path = isDynamic
        ? getPathname({
            locale,
            href: {
              pathname,
              params: { slug: paramsByLocale?.[locale]?.slug ?? "" },
            },
          })
        : getPathname({ locale, href: pathname as StaticPathname });
      return `${siteUrl}${path}`;
    };

    // hreflang alternates: her locale'in YEREL yolu.
    const languages: Record<string, string> = {};
    for (const l of routing.locales) languages[l] = url(l);

    for (const locale of routing.locales) {
      entries.push({
        url: url(locale),
        lastModified: now,
        changeFrequency: "weekly",
        priority,
        alternates: { languages },
      });
    }
  };

  for (const path of staticPaths) {
    addEntry(path, path === "/" ? 1 : 0.8);
  }
  for (const product of products) {
    const params = {
      tr: { slug: product.slugs.tr },
      en: { slug: product.slugs.en },
    };
    // Tanım/reklam sayfası (öncelik yüksek — SEO landing).
    addEntry("/planlar/[slug]", 0.9, params);
    // Teklif (form) sayfası — dönüşüm; biraz daha düşük öncelik.
    addEntry("/planlar/[slug]/teklif", 0.7, params);
  }

  return entries;
}
