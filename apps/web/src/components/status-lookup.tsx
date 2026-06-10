"use client";

// Teklif durum sorgu formu + sonuç (K30 / docs/12 §3, §6). Kullanıcı takip kodunu
// girer; lookupQuoteStatus server action'ı YALNIZ ürün + durum + tarih döner (KVKK:
// hassas veri gösterilmez). Başarı/bulunamadı/hata durumları nazikçe gösterilir.

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Search, AlertTriangle, PackageSearch, Calendar, Tag, CircleDot } from "lucide-react";
import { getProduct } from "@do/products";
import { lookupQuoteStatus, type LookupStatusResult } from "@/lib/lookup-quote-status";
import type { Locale } from "@/i18n/routing";

export function StatusLookup({ initialCode = "" }: { initialCode?: string }) {
  const t = useTranslations("quoteStatus");
  const locale = useLocale() as Locale;

  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LookupStatusResult | null>(null);

  // URL'de ?code= geldiyse (teklif başarı ekranı / e-posta linki) otomatik sorgula.
  useEffect(() => {
    if (initialCode) {
      void run(initialCode);
    }
  }, [initialCode]);

  async function run(value: string) {
    setLoading(true);
    setResult(null);
    const res = await lookupQuoteStatus(value);
    setResult(res);
    setLoading(false);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    void run(code);
  }

  const dateFmt = (d: Date | string) =>
    new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(d));

  const success = result?.ok && result.status;

  return (
    <div className="rounded-[var(--radius)] border border-border bg-card p-6 sm:p-8">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="status-code"
            className="mb-1.5 block text-sm font-bold text-muted-foreground"
          >
            {t("codeLabel")}
          </label>
          <input
            id="status-code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder={t("codePlaceholder")}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            className="w-full min-h-[44px] rounded-xl border-[1.5px] border-input bg-background px-4 py-3 font-mono text-lg tracking-[0.15em] text-foreground transition focus:border-secondary focus:outline-none focus:ring-4 focus:ring-secondary/15"
          />
        </div>

        <button
          type="submit"
          disabled={loading || code.trim().length < 4}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-destructive px-6 py-3.5 text-base font-bold text-white transition hover:-translate-y-0.5 hover:bg-[hsl(9_84%_38%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:translate-y-0 disabled:opacity-60"
        >
          <Search className="h-5 w-5" aria-hidden />
          {loading ? t("submitting") : t("submit")}
        </button>
      </form>

      {/* Hata / bulunamadı — nazik mesaj. */}
      {result && !result.ok && (
        <div
          role="alert"
          className="mt-5 flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{t(`errors.${result.error ?? "server"}`)}</span>
        </div>
      )}

      {/* Başarı — YALNIZ ürün + durum + tarih (KVKK). */}
      {success && (
        <div className="mt-6">
          <h2 className="font-heading text-lg text-foreground">{t("resultTitle")}</h2>
          <dl className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border">
            <Row icon={PackageSearch} label={t("product")}>
              {getProduct(result.status!.product)?.name[locale] ?? result.status!.product}
            </Row>
            <Row icon={CircleDot} label={t("status")}>
              <span className="inline-flex items-center rounded-pill bg-accent px-3 py-1 text-sm font-semibold text-secondary">
                {statusLabel(t, result.status!.status)}
              </span>
            </Row>
            <Row icon={Calendar} label={t("createdAt")}>
              {dateFmt(result.status!.createdAt)}
            </Row>
            {result.status!.policyEndDate && (
              <Row icon={Tag} label={t("policyEndDate")}>
                {dateFmt(result.status!.policyEndDate)}
              </Row>
            )}
          </dl>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{t("privacyNote")}</p>
          <button
            type="button"
            onClick={() => {
              setResult(null);
              setCode("");
            }}
            className="mt-4 rounded-pill border border-input bg-card px-5 py-2 text-sm font-medium transition hover:bg-muted"
          >
            {t("newSearch")}
          </button>
        </div>
      )}
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3.5">
      <dt className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4 text-secondary" aria-hidden />
        {label}
      </dt>
      <dd className="text-right text-sm font-semibold text-foreground">{children}</dd>
    </div>
  );
}

// Durum enum değerini i18n etiketine çevirir; bilinmeyen değer ham gösterilir.
function statusLabel(t: ReturnType<typeof useTranslations>, status: string): string {
  try {
    return t(`statuses.${status}`);
  } catch {
    return status;
  }
}
