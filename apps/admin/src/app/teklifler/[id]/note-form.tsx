"use client";

// Not ekleme formu — zaman damgalı CRM notu (Note modeli).
// Kaynak: docs/05 "Notlar: zaman damgalı not ekleme listesi".

import { useRef, useState, useTransition } from "react";
import { buttonClass } from "@/components/ui";
import { addNoteAction } from "./actions";

export function NoteForm({ quoteId }: { quoteId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLTextAreaElement>(null);

  function submit() {
    const body = ref.current?.value ?? "";
    if (!body.trim()) {
      setError("Not boş olamaz.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await addNoteAction(quoteId, body);
      if (!res.ok) setError(res.error ?? "İşlem başarısız.");
      else if (ref.current) ref.current.value = "";
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <textarea
        ref={ref}
        rows={3}
        placeholder="Görüşme notu, hatırlatma…"
        disabled={pending}
        className="w-full rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background"
      />
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div>
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className={buttonClass("secondary", "sm")}
        >
          {pending ? "Ekleniyor…" : "Not Ekle"}
        </button>
      </div>
    </div>
  );
}
