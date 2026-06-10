"use client";

// TC Kimlik No gibi hassas-ama-genel verilerin admin detayında MASKELİ gösterimi.
// Kaynak: docs/06 §"TC Kimlik No" → "gösterildiği yerlerde (admin) maskelenir".
//
// Varsayılan: ilk 3 + maskeleme + son 2 (örn. 123******45). "Göster/Gizle" toggle ile
// tam değer açılır (Doğukan değeri sigorta sistemine girmek için görür/kopyalar →
// workflow korunur). Tam değer zaten oturum arkasında; maskeleme omuz-sörfü / ekran
// görüntüsü içindir. Erişilebilir: aria-label'lı, focus'lanabilir butonlar.

import { useState } from "react";

/** İlk 3 + son 2 görünür, aradaki haneler `*` ile maskelenir. Kısa değerlerde tümü maskelenir. */
function maskTc(value: string): string {
  if (value.length <= 5) return "*".repeat(value.length);
  const head = value.slice(0, 3);
  const tail = value.slice(-2);
  const middle = "*".repeat(value.length - 5);
  return `${head}${middle}${tail}`;
}

export function MaskedValue({ value, label }: { value: string; label: string }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const shown = revealed ? value : maskTc(value);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // pano erişimi reddedildiyse sessizce yut — kullanıcı elle seçebilir.
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-sm font-medium tabular-nums" aria-live="polite">
        {shown}
      </span>
      <button
        type="button"
        onClick={() => setRevealed((v) => !v)}
        aria-label={revealed ? `${label} gizle` : `${label} göster`}
        aria-pressed={revealed}
        title={revealed ? "Gizle" : "Göster"}
        className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
      >
        {revealed ? <EyeOffIcon /> : <EyeIcon />}
      </button>
      <button
        type="button"
        onClick={copy}
        aria-label={`${label} kopyala`}
        title={copied ? "Kopyalandı" : "Kopyala"}
        className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </button>
    </div>
  );
}

// — Sade inline SVG ikonlar (harici bağımlılık yok). aria-hidden: anlam butonda. —

function EyeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9.88 9.88a3 3 0 0 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c6.5 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3.5 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
