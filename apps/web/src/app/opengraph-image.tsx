// OpenGraph görseli (docs/07 SEO kontrol listesi: "Open Graph + Twitter Card görselleri").
// Marka dili (docs/09): lacivert zemin, krem metin, turuncu "Özgan" vurgusu,
// teal/turuncu radyal ışıma. Tüm sayfalar bu kök OG görselini paylaşır.

import { ImageResponse } from "next/og";

export const alt = "Doğukan Özgan — Sigorta Danışmanlığı";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
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
        Sigorta Danışmanlığı
      </div>

      <div style={{ display: "flex", marginTop: 36, fontSize: 76, lineHeight: 1.05 }}>
        <span>
          Sigortanızda en uygun teklifi{" "}
          <span style={{ color: "#f25a32", fontStyle: "italic" }}>birlikte</span> bulalım.
        </span>
      </div>

      <div
        style={{
          display: "flex",
          marginTop: 40,
          fontSize: 30,
          color: "#c4d4e2",
          fontFamily: "Arial, sans-serif",
        }}
      >
        Doğukan Özgan · 20+ şirketi karşılaştıran bağımsız acente · Şişli / İstanbul
      </div>
    </div>,
    { ...size },
  );
}
