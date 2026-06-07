"use client";

// Manuel poliçe/müşteri ekleme formu (K32 / docs/12 §4).
// Ürün seçimi @do/ui Select (K33). Tarih girilirse kayıt POLICE_YAPILDI olur.

import { useState, useTransition } from "react";
import { getAllProducts } from "@do/products";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@do/ui";
import { buttonClass } from "@/components/ui";
import { createManualQuoteAction } from "./actions";

const inputClass =
  "w-full rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground " +
  "placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring " +
  "focus:ring-offset-1 focus:ring-offset-background";

export function ManualForm() {
  const products = getAllProducts();
  const [product, setProduct] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("product", product);
    setError(null);
    startTransition(async () => {
      // Başarıda action redirect eder (dönüş gelmez); yalnız hata gelirse gösterilir.
      const res = await createManualQuoteAction(fd);
      if (res && !res.ok) setError(res.error ?? "İşlem başarısız.");
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Field label="Ürün" required>
        <Select value={product} onValueChange={setProduct} disabled={pending}>
          <SelectTrigger className="text-sm" aria-label="Ürün seç">
            <SelectValue placeholder="Ürün seçin…" />
          </SelectTrigger>
          <SelectContent>
            {products.map((p) => (
              <SelectItem key={p.slug} value={p.slug}>
                {p.name.tr}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Ad Soyad" required>
          <input name="fullName" required disabled={pending} className={inputClass} />
        </Field>
        <Field label="Telefon" required>
          <input
            name="phone"
            type="tel"
            required
            disabled={pending}
            placeholder="05xx xxx xx xx"
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="E-posta (opsiyonel)">
        <input name="email" type="email" disabled={pending} className={inputClass} />
      </Field>

      <div className="rounded-lg border border-border bg-muted/30 p-3">
        <p className="text-xs text-muted-foreground">
          Poliçe tarihleri girilirse kayıt &quot;Poliçe Yapıldı&quot; olarak eklenir; boş
          bırakılırsa &quot;Yeni&quot; (takipte) olur.
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <Field label="Poliçe Başlangıç (opsiyonel)">
            <input name="policyStartDate" type="date" disabled={pending} className={inputClass} />
          </Field>
          <Field label="Poliçe Bitiş (opsiyonel)">
            <input name="policyEndDate" type="date" disabled={pending} className={inputClass} />
          </Field>
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <div>
        <button type="submit" disabled={pending} className={buttonClass("primary", "md")}>
          {pending ? "Kaydediliyor…" : "Kaydı Oluştur"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
      <span>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </span>
      {children}
    </label>
  );
}
