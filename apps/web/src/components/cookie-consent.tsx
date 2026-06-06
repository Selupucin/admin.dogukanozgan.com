"use client";

// Çerez onay banner'ı (KVKK). Kaynak: docs/06 §3, docs/02 "Global Bileşenler".
//
// DAVRANIŞ:
// - İlk ziyarette gösterilir (tercih kaydedilmemişse).
// - "Tümünü kabul et" / "Yalnızca zorunlu" seçenekleri tercihi localStorage'a yazar.
// - Zorunlu OLMAYAN çerezler (analitik vb.) onaydan ÖNCE çalışmaz (docs/06 §3).
// - Tercih `writeConsent` ile yazılır → `Analytics` bileşeni olayı dinler ve
//   YALNIZCA "all" onayında analitik script'i yükler (bkz. lib/consent.ts,
//   components/analytics.tsx).

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { readConsent, writeConsent, type ConsentValue } from "@/lib/consent";

export function CookieConsent() {
  const t = useTranslations("cookie");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Tercih kaydedilmemişse banner'ı göster.
    if (readConsent() === null) setVisible(true);
  }, []);

  function choose(value: ConsentValue) {
    writeConsent(value);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={t("policyLink")}
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl rounded-[var(--radius)] border border-border bg-card p-4 shadow-lg sm:p-5"
    >
      <p className="text-sm text-muted-foreground">
        {t("message")}{" "}
        <Link href="/cerez-politikasi" className="font-medium text-secondary underline">
          {t("policyLink")}
        </Link>
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => choose("essential")}
          className="rounded-pill border border-input px-4 py-2 text-sm font-medium transition hover:bg-muted"
        >
          {t("reject")}
        </button>
        <button
          type="button"
          onClick={() => choose("all")}
          className="rounded-pill bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:-translate-y-0.5"
        >
          {t("accept")}
        </button>
      </div>
    </div>
  );
}
