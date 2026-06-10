"use client";

// Teklif başarı ekranı (K30 / docs/12 §3). Gönderim başarılı olunca dönen durum-takip
// kodunu BÜYÜK/belirgin gösterir; kod kopyalanabilir ve durum sorgu sayfasına link
// verir (kod query ile ön-doldurulur). E-posta verildiyse kodun mail'e de gittiği notu.

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Copy, Check, Search } from "lucide-react";
import { Link } from "@/i18n/navigation";

export function QuoteSuccess({
  trackingCode,
  onReset,
}: {
  trackingCode: string | null;
  onReset: () => void;
}) {
  const t = useTranslations("form");
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!trackingCode) return;
    try {
      await navigator.clipboard.writeText(trackingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* pano erişimi yoksa sessiz geç — kod ekranda zaten görünür/seçilebilir */
    }
  }

  return (
    <div className="rounded-[var(--radius)] border border-secondary/30 bg-accent p-8 text-center">
      <CheckCircle2 className="mx-auto h-12 w-12 text-secondary" aria-hidden />
      <h3 className="mt-4 font-heading text-2xl text-foreground">{t("successTitle")}</h3>
      <p className="mt-2 text-sm text-accent-foreground/80">{t("successBody")}</p>

      {trackingCode && (
        <div className="mx-auto mt-6 max-w-md rounded-2xl border border-secondary/30 bg-card p-5 text-left shadow-sm">
          <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t("trackingLabel")}
          </span>
          <div className="mt-2 flex items-center gap-3">
            {/* Kod — büyük, mono, kopyalanabilir/seçilebilir. */}
            <code className="flex-1 select-all break-all rounded-lg bg-muted px-3 py-2.5 font-mono text-2xl font-bold tracking-[0.15em] text-foreground">
              {trackingCode}
            </code>
            <button
              type="button"
              onClick={copy}
              aria-label={copied ? t("trackingCopied") : t("trackingCopy")}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-input bg-card text-secondary transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {copied ? (
                <Check className="h-5 w-5" aria-hidden />
              ) : (
                <Copy className="h-5 w-5" aria-hidden />
              )}
            </button>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{t("trackingHint")}</p>

          <Link
            href={{ pathname: "/teklif-durumu", query: { code: trackingCode } }}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-destructive px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[hsl(9_84%_38%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          >
            <Search className="h-4 w-4" aria-hidden />
            {t("trackingStatusLink")}
          </Link>
          <p className="mt-3 text-center text-[0.7rem] leading-relaxed text-muted-foreground">
            {t("trackingEmailNote")}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={onReset}
        className="mt-6 rounded-pill border border-input bg-card px-5 py-2 text-sm font-medium transition hover:bg-muted"
      >
        {t("submitAnother")}
      </button>
    </div>
  );
}
