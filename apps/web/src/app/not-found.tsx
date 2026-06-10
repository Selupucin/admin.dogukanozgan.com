// Kök 404 — locale DIŞI yollar için (örn. /xyz, /tr olmayan ön ek). next-intl App
// Router deseninde gerçek <html>/<body> [locale]/layout.tsx'te kurulur; kök layout
// yalnız children geçirir. Bu yüzden kök not-found KENDİ <html>/<body>'sini kurar.
// Locale provider / tema burada YOKTUR → minimal, bağımsız, varsayılan dil (TR) ile.
// Çoğu 404 [locale] kapsamında yakalanır (zengin sayfa orada); burası yalnız ön-eksiz
// veya tanınmayan kök yollar içindir → kullanıcıyı varsayılan locale anasayfasına yönlendirir.
//
// SEO: not-found.tsx HTTP 404 statüsü döndürür; sitemap'e EKLENMEZ, indekslenmez.

import type { Metadata } from "next";
import { RootNotFoundActions } from "@/components/root-not-found-actions";

export const metadata: Metadata = {
  title: "Sayfa bulunamadı — Doğukan Özgan",
  robots: { index: false, follow: false },
};

export default function RootNotFound() {
  return (
    <html lang="tr">
      <body
        style={{
          margin: 0,
          boxSizing: "border-box",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.25rem",
          padding: "2rem",
          textAlign: "center",
          backgroundColor: "#f7f2e9",
          color: "#10243a",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
        }}
      >
        <p
          style={{ margin: 0, fontSize: "5rem", fontWeight: 600, lineHeight: 1, color: "#f25a32" }}
        >
          404
        </p>
        <h1 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 600 }}>Sayfa bulunamadı</h1>
        <p style={{ margin: 0, maxWidth: "32rem", color: "#3a5168" }}>
          Aradığınız sayfayı bulamadık. Anasayfaya dönerek devam edebilirsiniz.
          <br />
          <span style={{ fontSize: "0.875rem" }}>
            We couldn&apos;t find that page. Return to the homepage to continue.
          </span>
        </p>
        <RootNotFoundActions />
      </body>
    </html>
  );
}
