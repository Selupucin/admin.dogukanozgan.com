"use client";

// CRM durum değiştirme kontrolü — açılır menü + uygula.
// Kaynak: docs/05 "CRM durumu: açılır menüden değiştir". Geçişler crm.ts ile sınırlı.

import { useState, useTransition } from "react";
import type { QuoteStatus } from "@do/db";
import { STATUS_LABELS, allowedTransitions } from "@/lib/crm";
import { buttonClass } from "@/components/ui";
import { updateStatusAction } from "./actions";

const selectClass =
  "rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground " +
  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background";

export function StatusControl({ quoteId, current }: { quoteId: string; current: QuoteStatus }) {
  const targets = allowedTransitions(current);
  const [next, setNext] = useState<string>("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function apply() {
    if (!next) return;
    setError(null);
    startTransition(async () => {
      const res = await updateStatusAction(quoteId, next);
      if (!res.ok) setError(res.error ?? "İşlem başarısız.");
      else setNext("");
    });
  }

  if (targets.length === 0) {
    return <p className="text-sm text-muted-foreground">Bu durumdan geçiş tanımlı değil.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={next}
          onChange={(e) => setNext(e.target.value)}
          className={selectClass}
          disabled={pending}
        >
          <option value="">Yeni durum seç…</option>
          {targets.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={apply}
          disabled={!next || pending}
          className={buttonClass("primary", "sm")}
        >
          {pending ? "Güncelleniyor…" : "Durumu Güncelle"}
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
