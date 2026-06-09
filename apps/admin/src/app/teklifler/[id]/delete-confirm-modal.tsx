"use client";

// Teklif KALICI SİLME — çift onaylı, rastgele güvenlik kodu doğrulamalı modal.
// Kaynak: docs/05 §3 "Sil / anonimleştir", docs/06 §7 (KVKK kalıcı silme).
//
// Amaç: Kazara silmeyi önlemek için captcha-benzeri bir bariyer. Kullanıcı ekranda
// gösterilen rastgele kodu birebir yazmadan "Kalıcı Sil" butonu aktifleşmez.
// NOT: Bu yalnız İSTEMCİ tarafı bir UX bariyeridir; sunucu güvenliği deleteQuoteAction
// içindeki requireAuth + ObjectId guard (docs/13 §O1) ile sağlanır. Kod sunucuya
// doğrulatılmaz — gerçek koruma oturum + guard'dır.
//
// Erişilebilirlik (capture-guide-modal deseniyle aynı): role="dialog" + aria-modal,
// focus tuzağı, ESC ile kapatma, açılınca odak input'a, kapanınca tetikleyene döner,
// arka plan kaydırması kilitli.

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "@do/ui";
import { buttonClass } from "@/components/ui";

// Karıştırılması kolay karakterler (0/O, 1/I/L) hariç okunaklı set.
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;

/** İstemcide rastgele güvenlik kodu üretir (kriptografik kalite gerekmiyor; UX bariyeri). */
function generateCode(): string {
  let out = "";
  const cryptoObj = typeof window !== "undefined" ? window.crypto : undefined;
  if (cryptoObj?.getRandomValues) {
    const buf = new Uint32Array(CODE_LENGTH);
    cryptoObj.getRandomValues(buf);
    for (let i = 0; i < CODE_LENGTH; i++) {
      out += CODE_ALPHABET[buf[i]! % CODE_ALPHABET.length];
    }
  } else {
    for (let i = 0; i < CODE_LENGTH; i++) {
      out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
    }
  }
  return out;
}

interface DeleteConfirmModalProps {
  /** Onaylanınca çağrılır (deleteQuoteAction'ı tetikleyen üst bileşen). */
  onConfirm: () => void;
  /** Vazgeç / kapat (X / ESC / backdrop). */
  onClose: () => void;
  /** Silme işlemi sürüyor mu? (buton disabled + metin). */
  pending: boolean;
  /** Sunucudan dönen hata (varsa modalda gösterilir). */
  error: string | null;
}

export function DeleteConfirmModal({
  onConfirm,
  onClose,
  pending,
  error,
}: DeleteConfirmModalProps) {
  const titleId = useId();
  const descId = useId();
  const inputId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Her açılışta yeni kod (mount başına bir kez). "Yeni kod" ile elle de yenilenebilir.
  const [code, setCode] = useState<string>(() => generateCode());
  const [typed, setTyped] = useState("");

  // Büyük/küçük harf duyarsız + boşluk toleranslı karşılaştırma.
  const matches = useMemo(() => typed.trim().toUpperCase() === code.toUpperCase(), [typed, code]);

  // Açılışta: body scroll kilidi + odak input'a.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  function regenerate() {
    setCode(generateCode());
    setTyped("");
    inputRef.current?.focus();
  }

  // ESC ile kapatma + focus tuzağı (capture-guide-modal ile aynı desen).
  function onKeyDown(e: React.KeyboardEvent) {
    if (pending) return;
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== "Tab") return;
    const root = dialogRef.current;
    if (!root) return;
    const focusables = root.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
    );
    if (focusables.length === 0) return;
    const first = focusables[0]!;
    const last = focusables[focusables.length - 1]!;
    const active = document.activeElement;
    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function submit() {
    if (!matches || pending) return;
    onConfirm();
  }

  // Body'ye portal: liste tablosu gibi overflow-x-auto / containing-block oluşturan bir
  // ataya gömülünce `fixed` modal sıkışıp yatay kaydırma yapıyordu. Portal ile her zaman
  // viewport seviyesinde, tam genişlikte açılır (detay sayfasında da aynı çalışır).
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-foreground/50 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !pending) onClose();
      }}
      onKeyDown={onKeyDown}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
        className="flex max-h-[88vh] w-full max-w-md flex-col rounded-t-[var(--radius)] border border-destructive/40 bg-card shadow-xl outline-none sm:rounded-[var(--radius)]"
      >
        {/* Başlık */}
        <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
          <h2
            id={titleId}
            className="flex items-center gap-2 font-heading text-lg text-destructive"
          >
            <AlertTriangle className="h-5 w-5" aria-hidden />
            Teklifi kalıcı sil
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            aria-label="Kapat"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {/* İçerik */}
        <div className="flex flex-col gap-4 overflow-y-auto px-6 py-5">
          <p id={descId} className="text-sm text-muted-foreground">
            Bu teklifi kalıcı olarak silmek üzeresiniz. Bu işlem{" "}
            <span className="font-semibold text-destructive">GERİ ALINAMAZ</span>; yüklenen dosyalar
            (varsa) da silinir.
          </p>

          {/* Güvenlik kodu rozeti — kopyalanamaz/seçili, monospace */}
          <div className="flex flex-col gap-2">
            <span className="text-xs text-muted-foreground">
              Onaylamak için aşağıdaki güvenlik kodunu birebir yazın:
            </span>
            <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
              <span
                aria-label={`Güvenlik kodu: ${code.split("").join(" ")}`}
                className="select-none font-mono text-2xl font-bold tracking-[0.35em] text-foreground"
                style={{ userSelect: "none" }}
              >
                {code}
              </span>
              <button
                type="button"
                onClick={regenerate}
                disabled={pending}
                className={buttonClass("ghost", "sm")}
              >
                Yeni kod
              </button>
            </div>
          </div>

          {/* Doğrulama input'u */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor={inputId} className="text-xs text-muted-foreground">
              Güvenlik kodu
            </label>
            <input
              id={inputId}
              ref={inputRef}
              type="text"
              inputMode="text"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="characters"
              spellCheck={false}
              value={typed}
              disabled={pending}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submit();
                }
              }}
              onPaste={(e) => e.preventDefault()}
              placeholder="Kodu buraya yazın"
              aria-invalid={typed.length > 0 && !matches}
              className={cn(
                "h-11 rounded-xl border bg-background px-3 font-mono text-base tracking-widest uppercase outline-none transition-colors",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                typed.length > 0 && !matches ? "border-destructive/60" : "border-border",
              )}
            />
            {typed.length > 0 && !matches && (
              <p className="text-xs text-destructive">Kod eşleşmiyor.</p>
            )}
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </div>

        {/* Aksiyonlar */}
        <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className={buttonClass("outline", "sm")}
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!matches || pending}
            className={buttonClass("destructive", "sm")}
          >
            {pending ? "Siliniyor…" : "Kalıcı Sil"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
