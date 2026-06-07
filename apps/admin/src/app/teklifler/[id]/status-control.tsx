"use client";

// CRM durum değiştirme kontrolü — açılır menü + uygula.
// Kaynak: docs/05 "CRM durumu: açılır menüden değiştir". Geçişler crm.ts ile sınırlı.
// K32 (docs/12): POLICE_YAPILDI seçilince poliçe başlangıç + bitiş tarihi ZORUNLU.

import { useState, useTransition } from "react";
import type { QuoteStatus } from "@do/db";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@do/ui";
import { STATUS_LABELS, allowedTransitions } from "@/lib/crm";
import { buttonClass } from "@/components/ui";
import { updateStatusAction } from "./actions";

const dateClass =
  "rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground " +
  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background";

export function StatusControl({ quoteId, current }: { quoteId: string; current: QuoteStatus }) {
  const targets = allowedTransitions(current);
  const [next, setNext] = useState<string>("");
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const needsDates = next === "POLICE_YAPILDI";

  function apply() {
    if (!next) return;
    if (needsDates && (!start || !end)) {
      setError("Poliçe başlangıç ve bitiş tarihi zorunludur.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await updateStatusAction(quoteId, next, needsDates ? { start, end } : undefined);
      if (!res.ok) setError(res.error ?? "İşlem başarısız.");
      else {
        setNext("");
        setStart("");
        setEnd("");
      }
    });
  }

  if (targets.length === 0) {
    return <p className="text-sm text-muted-foreground">Bu durumdan geçiş tanımlı değil.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <Select value={next} onValueChange={setNext} disabled={pending}>
        <SelectTrigger className="min-h-[40px] py-2 text-sm" aria-label="Yeni durum seç">
          <SelectValue placeholder="Yeni durum seç…" />
        </SelectTrigger>
        <SelectContent>
          {targets.map((s) => (
            <SelectItem key={s} value={s}>
              {STATUS_LABELS[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {needsDates && (
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground">
            Poliçe yapıldı — başlangıç ve bitiş tarihi girin (zorunlu).
          </p>
          <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
            Başlangıç
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className={dateClass}
              disabled={pending}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
            Bitiş
            <input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className={dateClass}
              disabled={pending}
            />
          </label>
        </div>
      )}

      <button
        type="button"
        onClick={apply}
        disabled={!next || pending}
        className={buttonClass("primary", "sm")}
      >
        {pending ? "Güncelleniyor…" : "Durumu Güncelle"}
      </button>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
