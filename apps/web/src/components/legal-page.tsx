// Yasal sayfa kabuğu (ortak görünüm) — KVKK / Gizlilik / Çerez politikası.
// Kaynak: docs/06 §4 "Yasal Sayfalar", docs/02 (sayfa listesi).
//
// ⚠️ İçerik metinleri PLACEHOLDER (taslak). Nihai metin hukukçu / KVKK danışmanı
// onayı bekler (docs/06 sorumluluk reddi + §8). Üstte taslak uyarısı gösterilir.
// TODO(doc): Hukukçu onaylı nihai metinler gelince bu placeholder içerik değişir.

import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";

interface LegalPageProps {
  title: string;
  lastUpdated?: string;
  children: ReactNode;
}

export async function LegalPage({ title, lastUpdated, children }: LegalPageProps) {
  const t = await getTranslations("legal");
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-heading text-4xl font-semibold tracking-tight text-foreground">
        {title}
      </h1>
      {lastUpdated && (
        <p className="mt-2 text-sm text-muted-foreground">
          {t("lastUpdated")}: {lastUpdated}
        </p>
      )}

      {/* TASLAK UYARISI — hukukçu onayı bekliyor (docs/06). */}
      <div className="mt-6 rounded-xl border border-secondary/40 bg-accent/60 p-4 text-sm text-accent-foreground">
        {t("draftNotice")}
      </div>

      <div className="prose prose-neutral mt-8 max-w-none text-foreground dark:prose-invert">
        {children}
      </div>
    </main>
  );
}
