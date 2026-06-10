"use client";

// Kök 404 (locale dışı) için geri/anasayfa butonları. Bu sayfa next-intl provider DIŞINDA
// olduğundan @/i18n/navigation KULLANILMAZ; düz `window.history`/`<a>` ile çalışır.
// Stil inline (kök not-found teması inline; Tailwind tema bağlamı burada yok).
// Düz next/link kullanılır (locale provider gerektirmez; @/i18n/navigation DEĞİL).

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
      <button
        type="button"
        onClick={goBack}
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
