"use client";

// KVKK aksiyonları — anonimleştir / kalıcı sil (onay diyaloglu).
// Kaynak: docs/05 "Sil / anonimleştir: KVKK silme talebi için", docs/06 §7.

import { useState, useTransition } from "react";
import { buttonClass } from "@/components/ui";
import { anonymizeQuoteAction, deleteQuoteAction } from "./actions";

export function KvkkActions({ quoteId }: { quoteId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function anonymize() {
    const ok = window.confirm(
      "Bu talep ANONİMLEŞTİRİLECEK: ad, telefon, e-posta, form verisi ve yüklenen " +
        "dosyalar silinir; yalnızca ürün/durum/tarih istatistiği kalır. Devam edilsin mi?",
    );
    if (!ok) return;
    setError(null);
    startTransition(async () => {
      const res = await anonymizeQuoteAction(quoteId);
      if (!res.ok) setError(res.error ?? "İşlem başarısız.");
    });
  }

  function remove() {
    const ok = window.confirm(
      "Bu talep KALICI olarak silinecek (notlar ve yüklenen dosyalar dahil). " +
        "Bu işlem geri alınamaz. Devam edilsin mi?",
    );
    if (!ok) return;
    setError(null);
    startTransition(async () => {
      // Başarılıysa server action /teklifler'e yönlendirir.
      await deleteQuoteAction(quoteId);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Veri sahibi silme talebi veya saklama süresi dolduğunda kullanın. Anonimleştirme kişisel
        veriyi kaldırır ama istatistik kaydını korur; silme her şeyi kaldırır.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={anonymize}
          disabled={pending}
          className={buttonClass("outline", "sm")}
        >
          Anonimleştir
        </button>
        <button
          type="button"
          onClick={remove}
          disabled={pending}
          className={buttonClass("destructive", "sm")}
        >
          Kalıcı Sil
        </button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
