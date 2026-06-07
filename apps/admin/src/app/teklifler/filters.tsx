"use client";

// Teklif listesi filtre çubuğu — ürün, durum, tarih aralığı, arama.
// Kaynak: docs/05 "Filtreler". URL query string üzerinden çalışır (paylaşılabilir/
// işaretlenebilir; sunucu bileşeni searchParams'tan okur).

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { getAllProducts } from "@do/products";
import { QUOTE_STATUSES, STATUS_LABELS } from "@/lib/crm";
import { buttonClass } from "@/components/ui";
import { FilterSelect } from "@/components/filter-select";

const controlClass =
  "rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground " +
  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background";

export function Filters({
  current,
}: {
  current: {
    product?: string;
    status?: string;
    from?: string;
    to?: string;
    search?: string;
  };
}) {
  const router = useRouter();
  const params = useSearchParams();
  const products = getAllProducts();

  const update = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      router.push(`/teklifler?${next.toString()}`);
    },
    [params, router],
  );

  const reset = useCallback(() => router.push("/teklifler"), [router]);

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-4">
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Ara (ad / telefon)
        <input
          type="search"
          defaultValue={current.search ?? ""}
          placeholder="Ad veya telefon"
          className={controlClass}
          onKeyDown={(e) => {
            if (e.key === "Enter") update("q", (e.target as HTMLInputElement).value);
          }}
          onBlur={(e) => update("q", e.target.value)}
        />
      </label>

      <label className="flex w-44 flex-col gap-1 text-xs font-medium text-muted-foreground">
        Ürün
        <FilterSelect
          ariaLabel="Ürüne göre filtrele"
          value={current.product ?? ""}
          onChange={(v) => update("product", v)}
          options={products.map((p) => ({ value: p.slug, label: p.name.tr }))}
        />
      </label>

      <label className="flex w-44 flex-col gap-1 text-xs font-medium text-muted-foreground">
        Durum
        <FilterSelect
          ariaLabel="Duruma göre filtrele"
          value={current.status ?? ""}
          onChange={(v) => update("status", v)}
          options={QUOTE_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] }))}
        />
      </label>

      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Başlangıç
        <input
          type="date"
          defaultValue={current.from ?? ""}
          className={controlClass}
          onChange={(e) => update("from", e.target.value)}
        />
      </label>

      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Bitiş
        <input
          type="date"
          defaultValue={current.to ?? ""}
          className={controlClass}
          onChange={(e) => update("to", e.target.value)}
        />
      </label>

      <button type="button" onClick={reset} className={buttonClass("ghost", "sm")}>
        Temizle
      </button>
    </div>
  );
}
