// /.well-known/security.txt — RFC 9116 güvenlik açığı bildirim politikası
// (docs/07 SEO/standartlar; docs/13 güvenlik). Güvenlik araştırmacılarının açık
// bildirebileceği iletişim kanalını text/plain olarak yayınlar.
//
// İçerik site.ts'ten (iletişim e-postası) + sabit iletişim sayfası URL'inden üretilir.
// Expires: RFC 9116, dosyanın 1 yıldan kısa sürede yenilenmesini önerir.
// TODO(doc): "Expires" tarihi yıllık güncellenmeli (docs/07 / docs/11 go-live).

import { contact, siteUrl } from "@/lib/site";

// Statik üretim (içerik build zamanında sabittir).
export const dynamic = "force-static";

export function GET() {
  const body = [
    `Contact: mailto:${contact.email}`,
    `Contact: ${siteUrl}/tr/iletisim`,
    "Expires: 2027-01-01T00:00:00.000Z",
    "Preferred-Languages: tr, en",
    `Canonical: ${siteUrl}/.well-known/security.txt`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      // Standart dosya nadiren değişir → uzun süreli önbellek (1 gün CDN, 1 saat tarayıcı).
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
