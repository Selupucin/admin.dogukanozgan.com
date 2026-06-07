"use client";

// İletişim talepleri filtre çubuğu — durum + arama (docs/12 §4 K31).
// URL query string üzerinden çalışır (paylaşılabilir; sunucu searchParams'tan okur).

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { CONTACT_STATUSES, CONTACT_STATUS_LABELS } from "@/lib/contact-crm";
import { buttonClass } from "@/components/ui";
import { FilterSelect } from "@/components/filter-select";

const controlClass =
  "rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground " +
  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background";

export function ContactFiltersBar({ current }: { current: { status?: string; search?: string } }) {
  const router = useRouter();
  const params = useSearchParams();

  const update = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      router.push(`/iletisim-talepleri?${next.toString()}`);
    },
    [params, router],
  );

  const reset = useCallback(() => router.push("/iletisim-talepleri"), [router]);

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-4">
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Ara (ad / telefon / konu)
        <input
          type="search"
          defaultValue={current.search ?? ""}
          placeholder="Ad, telefon veya konu"
          className={controlClass}
          onKeyDown={(e) => {
            if (e.key === "Enter") update("q", (e.target as HTMLInputElement).value);
          }}
          onBlur={(e) => update("q", e.target.value)}
        />
      </label>

      <label className="flex w-44 flex-col gap-1 text-xs font-medium text-muted-foreground">
        Durum
        <FilterSelect
          ariaLabel="Duruma göre filtrele"
          value={current.status ?? ""}
          onChange={(v) => update("status", v)}
          options={CONTACT_STATUSES.map((s) => ({
            value: s,
            label: CONTACT_STATUS_LABELS[s],
          }))}
        />
      </label>

      <button type="button" onClick={reset} className={buttonClass("ghost", "sm")}>
        Temizle
      </button>
    </div>
  );
}
