// Ürün bazlı dinamik OpenGraph görseli — /[locale]/planlar/[slug] (docs/07 SEO
// kontrol listesi: "Open Graph + Twitter Card görselleri", "her ürün sayfası kendi
// adıyla paylaşılır"). Marka dili (docs/09): lacivert (#10243a) zemin, krem metin,
// turuncu "Özgan" vurgusu, teal/turuncu radyal ışıma. Kök app/opengraph-image.tsx
// ile aynı görsel dil; burada başlık ürün adıdır + locale'e göre alt ibare.
//
// Bu route otomatik olarak ürün sayfası `generateMetadata` çıktısındaki
// openGraph.images / twitter.images alanlarına eklenir (Next.js metadata file
// convention) — elle images set etmeye gerek yoktur.

import { ImageResponse } from "next/og";
import { getProductByLocalizedSlug, getLocalizedProductSlugs } from "@do/products";
import { routing } from "@/i18n/routing";

type Locale = (typeof routing.locales)[number];

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Statik üretim: her locale × YEREL ürün slug kombinasyonu için OG görseli (SSG).
// Ürün sayfası generateStaticParams ile birebir aynı parametre uzayı → her ürün
// kendi kapağına sahip olur.
export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getLocalizedProductSlugs(locale).map((slug) => ({ slug })),
  );
}

// Erişilebilir alt metin: locale + ürün adına göre. Sayfa metadata'sındaki
// openGraph görseline `alt` olarak yansır.
export async function generateImageMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const loc = locale as Locale;
  const product = getProductByLocalizedSlug(loc, slug);
  const name = product ? product.name[loc] : "Doğukan Özgan";
  const alt =
    loc === "en"
      ? `${name} — Doğukan Özgan insurance advisory`
      : `${name} — Doğukan Özgan sigorta danışmanlığı`;
  return [{ id: "product", size, contentType, alt }];
}

export default async function ProductOpengraphImage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const loc = locale as Locale;
  const product = getProductByLocalizedSlug(loc, slug);

  // Ürün adı (locale'e göre) + kısa alt ibare. Ürün bulunamazsa marka adına düşer.
  const productName = product ? product.name[loc] : "Doğukan Özgan";
  const eyebrow = loc === "en" ? "Insurance Advisory" : "Sigorta Danışmanlığı";
  const subtitle = loc === "en" ? "Free quote" : "Ücretsiz teklif";
  const footer =
    loc === "en"
      ? "Doğukan Özgan · Comparing 20+ companies · Şişli / İstanbul"
      : "Doğukan Özgan · 20+ şirketi karşılaştıran bağımsız acente · Şişli / İstanbul";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
        background: "#10243a",
        backgroundImage:
          "radial-gradient(circle at 80% 15%, rgba(28,110,106,0.45), transparent 45%), radial-gradient(circle at 10% 90%, rgba(242,90,50,0.35), transparent 45%)",
        color: "#f7f2e9",
        fontFamily: "Georgia, 'Times New Roman', serif",
      }}
    >
      {/* Marka wordmark + branş etiketi (kök OG ile aynı dil) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          fontSize: 30,
          color: "#e3efed",
          fontFamily: "Arial, sans-serif",
          fontWeight: 700,
          letterSpacing: 2,
          textTransform: "uppercase",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: "#f25a32",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#10243a",
            fontSize: 28,
          }}
        >
          DÖ
        </div>
        {eyebrow}
      </div>

      {/* Ürün adı — bu görselin kapak başlığı */}
      <div style={{ display: "flex", marginTop: 36, fontSize: 78, lineHeight: 1.05 }}>
        <span>{productName}</span>
      </div>

      {/* Kısa alt ibare (turuncu pill) */}
      <div style={{ display: "flex", marginTop: 32 }}>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            background: "#f25a32",
            color: "#10243a",
            fontFamily: "Arial, sans-serif",
            fontWeight: 700,
            fontSize: 28,
            letterSpacing: 1,
            padding: "12px 28px",
            borderRadius: 999,
          }}
        >
          {subtitle}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          marginTop: 40,
          fontSize: 28,
          color: "#c4d4e2",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {footer}
      </div>
    </div>,
    { ...size },
  );
}
