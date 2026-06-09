"use client";

// Teklif listesi satırında "Sil" butonu — tıklanınca MEVCUT güvenli silme modalını
// (rastgele 6 hane kod doğrulamalı) açar ve aynı deleteQuoteAction'ı tetikler.
// Kaynak: docs/05 §3 "Sil / anonimleştir", docs/06 §7 (KVKK kalıcı silme).
//
// YENİ silme mantığı YOK: hem modal (DeleteConfirmModal) hem server action
// (deleteQuoteAction) detay sayfasındakiyle birebir aynıdır — tekrar kullanılır.
// Başarılı silmede deleteQuoteAction redirect("/teklifler") ile listeyi tazeler.

import { useState, useTransition } from "react";
import { buttonClass } from "@/components/ui";
import { deleteQuoteAction } from "./[id]/actions";
import { DeleteConfirmModal } from "./[id]/delete-confirm-modal";

export function QuoteRowDelete({ quoteId }: { quoteId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  function confirmDelete() {
    setError(null);
    startTransition(async () => {
      try {
        // Başarılıysa server action /teklifler'e redirect eder (sonrası çalışmaz).
        await deleteQuoteAction(quoteId);
      } catch (err) {
        // redirect() bir error fırlatır; Next bunu yutar. Gerçek hata burada görünür.
        if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) return;
        setError("Silme başarısız. Lütfen tekrar deneyin.");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        disabled={pending}
        className={buttonClass("destructive", "sm")}
      >
        Sil
      </button>

      {open && (
        <DeleteConfirmModal
          pending={pending}
          error={error}
          onClose={() => {
            if (pending) return;
            setOpen(false);
            setError(null);
          }}
          onConfirm={confirmDelete}
        />
      )}
    </>
  );
}
