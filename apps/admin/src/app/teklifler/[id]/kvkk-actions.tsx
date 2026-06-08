"use client";

// KVKK aksiyonları — anonimleştir / kalıcı sil.
// Kaynak: docs/05 §3 "Sil / anonimleştir: KVKK silme talebi için", docs/06 §7.
//
// Anonimleştirme: tek native onay (window.confirm) yeterli — veri istatistiğe iner.
// KALICI SİL: çift onaylı, rastgele güvenlik kodu doğrulamalı modal (kazara-silme
// bariyeri). Sunucu güvenliği deleteQuoteAction içindeki requireAuth + ObjectId
// guard (docs/13 §O1) ile sağlanır; modal yalnız istemci UX bariyeridir.

import { useState, useTransition } from "react";
import { buttonClass } from "@/components/ui";
import { anonymizeQuoteAction, deleteQuoteAction } from "./actions";
import { DeleteConfirmModal } from "./delete-confirm-modal";

export function KvkkActions({ quoteId }: { quoteId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

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

  function confirmDelete() {
    setError(null);
    startTransition(async () => {
      try {
        // Başarılıysa server action /teklifler'e redirect eder (bu satırdan sonrası çalışmaz).
        await deleteQuoteAction(quoteId);
      } catch (err) {
        // redirect() bir error fırlatır; Next bunu yutar. Gerçek hata burada görünür.
        if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) return;
        setError("Silme başarısız. Lütfen tekrar deneyin.");
      }
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
          onClick={() => {
            setError(null);
            setDeleteOpen(true);
          }}
          disabled={pending}
          className={buttonClass("destructive", "sm")}
        >
          Teklifi Sil
        </button>
      </div>
      {error && !deleteOpen && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      {deleteOpen && (
        <DeleteConfirmModal
          pending={pending}
          error={error}
          onClose={() => {
            if (pending) return;
            setDeleteOpen(false);
            setError(null);
          }}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
