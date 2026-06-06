"use client";

// PrefilledAutoForm — teklif sayfası için AutoForm sarmalayıcısı.
// Hesaplayıcıdan gelen ön-doldurma değerlerini URL query'sinden (client-side) okur,
// böylece teklif sayfası SUNUCUDA STATİK (SSG) kalır — searchParams sunucuda okunmaz.
// Yalnızca ürünün GERÇEK alan adlarıyla eşleşen query parametreleri kullanılır (güvenli).

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { AutoForm } from "./auto-form";
import type { ProductDefinition, Locale } from "./types-bridge";

export function PrefilledAutoForm({
  product,
  locale,
}: {
  product: ProductDefinition;
  locale: Locale;
}) {
  const searchParams = useSearchParams();

  const defaultValues = useMemo(() => {
    const values: Record<string, unknown> = {};
    for (const field of product.fields) {
      const raw = searchParams.get(field.name);
      if (raw === null) continue;
      if (field.type === "number") {
        const n = Number(raw);
        if (!Number.isNaN(n)) values[field.name] = n;
      } else if (field.type === "checkbox") {
        values[field.name] = raw === "true";
      } else {
        values[field.name] = raw;
      }
    }
    return values;
  }, [product.fields, searchParams]);

  // key: prefill değişince formu yeniden monte et (defaultValues mount'ta okunur).
  const key = useMemo(
    () =>
      Object.entries(defaultValues)
        .map(([k, v]) => `${k}=${String(v)}`)
        .join("&"),
    [defaultValues],
  );

  return <AutoForm key={key} product={product} locale={locale} defaultValues={defaultValues} />;
}
