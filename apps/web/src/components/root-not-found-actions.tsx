"use client";

// Kök 404 (locale dışı) için geri/anasayfa butonları. Bu sayfa next-intl provider DIŞINDA
// olduğundan @/i18n/navigation KULLANILMAZ; düz next/link + window.history ile çalışır.
// Stil inline + scoped <style> (kök not-found teması inline; Tailwind tema bağlamı yok).
// Hover/focus efektleri site diliyle uyumlu (turuncu CTA hover koyulaşma + hafif kalkma).

import Link from "next/link";

export function RootNotFoundActions() {
  function goBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/tr";
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.875rem",
        justifyContent: "center",
        marginTop: "0.5rem",
      }}
    >
      {/* Scoped hover/focus — inline stil :hover desteklemediğinden sınıf tabanlı. */}
      <style>{`
        .nf-btn { transition: background-color .18s ease, color .18s ease, transform .18s ease, box-shadow .18s ease; }
        .nf-back:hover { background-color:#d9421b !important; transform:translateY(-2px); box-shadow:0 10px 24px -10px rgba(242,90,50,.6); }
        .nf-home:hover { background-color:#10243a !important; color:#fffdf8 !important; transform:translateY(-2px); }
        .nf-btn:focus-visible { outline:none; box-shadow:0 0 0 2px #f7f2e9, 0 0 0 4px #1c6e6a; }
        @media (prefers-reduced-motion: reduce){ .nf-btn:hover{ transform:none; } }
      `}</style>
      <button
        type="button"
        onClick={goBack}
        className="nf-btn nf-back"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          borderRadius: "9999px",
          backgroundColor: "#f25a32",
          color: "#fffdf8",
          padding: "0.875rem 1.5rem",
          fontWeight: 700,
          border: "none",
          cursor: "pointer",
          fontSize: "1rem",
        }}
      >
        ← Geri dön
      </button>
      <Link
        href="/tr"
        className="nf-btn nf-home"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          borderRadius: "9999px",
          backgroundColor: "transparent",
          color: "#10243a",
          padding: "0.8125rem 1.5rem",
          fontWeight: 700,
          textDecoration: "none",
          border: "1.5px solid #10243a",
          fontSize: "1rem",
        }}
      >
        Anasayfaya dön
      </Link>
    </div>
  );
}
