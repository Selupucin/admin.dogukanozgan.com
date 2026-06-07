"use client";

// Poliçe tarihlerini sonradan gir/güncelle (K32, docs/12).
// POLICE_YAPILDI durumundaki teklifte başlangıç/bitiş tarihi düzeltmek için.

import { useState, useTransition } from "react";
import { buttonClass } from "@/components/ui";
import { setPolicyDatesAction } from "./actions";

const dateClass =
  "rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground " +
  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background";

/** ISO Date'i input[type=date] değerine (YYYY-MM-DD) çevirir. */
function toInput(date: Date | null): string {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

export function PolicyDates({
  quoteId,
  start,
  end,
}: {
  quoteId: string;
  start: Date | null;
  end: Date | null;
}) {
  const [startVal, setStartVal] = useState(toInput(start));
  const [endVal, setEndVal] = useState(toInput(end));
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  function save() {
    if (!startVal || !endVal) {
      setError("Başlangıç ve bitiş tarihi girin.");
      return;
    }
    setError(null);
    setOk(false);
    startTransition(async () => {
      const res = await setPolicyDatesAction(quoteId, startVal, endVal);
      if (!res.ok) setError(res.error ?? "İşlem başarısız.");
      else setOk(true);
    });
  }

  const missing = !start || !end;

  return (
    <div className="flex flex-col gap-2">
      {missing && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
          Poliçe tarihleri eksik — lütfen başlangıç ve bitiş tarihini girin.
        </p>
      )}
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Başlangıç
        <input
          type="date"
          value={startVal}
          onChange={(e) => setStartVal(e.target.value)}
          className={dateClass}
          disabled={pending}
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Bitiş
        <input
          type="date"
          value={endVal}
          onChange={(e) => setEndVal(e.target.value)}
          className={dateClass}
          disabled={pending}
        />
      </label>
      <div>
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className={buttonClass("outline", "sm")}
        >
          {pending ? "Kaydediliyor…" : "Tarihleri Kaydet"}
        </button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {ok && <p className="text-sm text-secondary">Tarihler kaydedildi.</p>}
    </div>
  );
}
