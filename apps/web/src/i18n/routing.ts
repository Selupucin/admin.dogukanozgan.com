import { defineRouting } from "next-intl/routing";

// Çok dilli rota tanımı. Kaynak: docs/07 (TR varsayılan, EN ikincil; /[locale]/...).
//
// pathnames: İÇ (kanonik) yol → her locale'in DIŞ (yerel) yolu. İç yollar TR
// klasör yapısıyla aynıdır (örn. "/planlar"); next-intl Link/router/usePathname
// bunları locale'e göre yerel yola otomatik çevirir. EN'de yol parçaları çevrilir
// (docs/02 yol eşleme tablosu). Ürün slug'ı (param DEĞERİ) ayrı olarak
// definitions.ts slugs.en ile çözülür (next-intl yalnız statik segmentleri çevirir).
export const routing = defineRouting({
  locales: ["tr", "en"],
  defaultLocale: "tr",
  pathnames: {
    "/": "/",
    "/planlar": { tr: "/planlar", en: "/plans" },
    // Dinamik ürün rotası: statik "plans" segmenti çevrilir; [slug] param değeri
    // ayrıca yerelleştirilir (bkz. getLocalizedSlug / getProductByLocalizedSlug).
    // TANIM/REKLAM sayfası (form yok; hesaplayıcı + "Teklif Al" CTA). docs/02/03.
    "/planlar/[slug]": { tr: "/planlar/[slug]", en: "/plans/[slug]" },
    // TEKLİF (form) sayfası — ayrı alt segment ("teklif"/"quote"). docs/02/03.
    "/planlar/[slug]/teklif": {
      tr: "/planlar/[slug]/teklif",
      en: "/plans/[slug]/quote",
    },
    "/hakkimda": { tr: "/hakkimda", en: "/about" },
    "/iletisim": { tr: "/iletisim", en: "/contact" },
    // Teklif durum sorgulama (K30 / docs/12 §3, docs/02). Kod ile yalnız
    // ürün+durum+tarih gösterilir; hassas veri yok.
    "/teklif-durumu": { tr: "/teklif-durumu", en: "/quote-status" },
    "/sss": { tr: "/sss", en: "/faq" },
    "/kvkk": { tr: "/kvkk", en: "/privacy-notice" },
    "/gizlilik": { tr: "/gizlilik", en: "/privacy" },
    "/cerez-politikasi": { tr: "/cerez-politikasi", en: "/cookie-policy" },
  },
});

export type Locale = (typeof routing.locales)[number];
export type AppPathname = keyof typeof routing.pathnames;
/** Param ALMAYAN (statik) kanonik yollar — Link href tipi olarak güvenli. */
export type StaticPathname = Exclude<AppPathname, "/planlar/[slug]" | "/planlar/[slug]/teklif">;
