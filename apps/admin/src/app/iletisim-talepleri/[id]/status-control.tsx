"use client";

// İletişim talebi durum değiştirme kontrolü — açılır menü + uygula (docs/12 K31).
// Geçişler contact-crm.ts ile sınırlı. @do/ui Select kullanır (K33).

import { useState, useTransition } from "react";
import type { ContactStatus } from "@do/db";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@do/ui";
import { CONTACT_STATUS_LABELS, allowedContactTransitions } from "@/lib/contact-crm";
import { buttonClass } from "@/components/ui";
import { updateContactStatusAction } from "../actions";

export function ContactStatusControl({ id, current }: { id: string; current: ContactStatus }) {
  const targets = allowedContactTransitions(current);
  const [next, setNext] = useState<string>("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function apply() {
    if (!next) return;
    setError(null);
    startTransition(async () => {
      const res = await updateContactStatusAction(id, next);
      if (!res.ok) setError(res.error ?? "İşlem başarısız.");
      else setNext("");
    });
  }

  if (targets.length === 0) {
    return <p className="text-sm text-muted-foreground">Bu durumdan geçiş tanımlı değil.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <Select value={next} onValueChange={setNext} disabled={pending}>
        <SelectTrigger className="min-h-[40px] py-2 text-sm" aria-label="Yeni durum seç">
          <SelectValue placeholder="Yeni durum seç…" />
        </SelectTrigger>
        <SelectContent>
          {targets.map((s) => (
            <SelectItem key={s} value={s}>
              {CONTACT_STATUS_LABELS[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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
