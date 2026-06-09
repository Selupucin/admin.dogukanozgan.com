"use client";

// "PIN'i unuttum" akışı — e-postaya geçici kod iste → maildeki kod + yeni PIN + doğrulama.
// docs/05: requestPinResetAction (kod gönder) → confirmPinResetAction (kod doğrula + yeni PIN).
// Hem kilit overlay'inde (alt-modal) hem ayarlar sayfasında kullanılır.

import { useRef, useState } from "react";
import { cn } from "@do/ui";
import { buttonClass } from "@/components/ui";
import { PinInput } from "@/components/pin-input";
import { requestPinResetAction, confirmPinResetAction } from "@/app/security-actions";

interface ForgotPinFlowProps {
  /** Başarıyla yeni PIN kurulunca (kilit overlay'inde overlay'i kapatmak için). */
  onSuccess?: () => void;
  /** Akıştan vazgeçilince (geri dön). */
  onCancel?: () => void;
}

export function ForgotPinFlow({ onSuccess, onCancel }: ForgotPinFlowProps) {
  const [phase, setPhase] = useState<"idle" | "code">("idle");
  const [emailCode, setEmailCode] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const codeRef = useRef<HTMLInputElement>(null);

  async function requestCode() {
    if (pending) return;
    setPending(true);
    setError(null);
    setInfo(null);
    try {
      const res = await requestPinResetAction();
      if (res.ok) {
        setInfo(res.message ?? "Geçici kod gönderildi.");
        setPhase("code");
        setTimeout(() => codeRef.current?.focus(), 50);
      } else {
        setError(res.error);
      }
    } finally {
      setPending(false);
    }
  }

  async function confirmReset() {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.set("emailCode", emailCode);
      fd.set("newPin", newPin);
      fd.set("confirm", confirm);
      const res = await confirmPinResetAction(fd);
      if (res.ok) {
        onSuccess?.();
      } else {
        setError(res.error);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        E-posta adresinize geçici bir kod gönderilir. Kodu girip yeni bir PIN oluşturabilirsiniz.
      </p>

      {phase === "idle" ? (
        <button
          type="button"
          onClick={requestCode}
          disabled={pending}
          className={buttonClass("primary", "md")}
        >
          {pending ? "Gönderiliyor…" : "Geçici kod gönder"}
        </button>
      ) : (
        <>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">E-posta kodu</label>
            <input
              ref={codeRef}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={emailCode}
              disabled={pending}
              onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className={cn(
                "rounded-xl border border-input bg-background px-3 py-2 text-center text-lg tracking-[0.4em] outline-none transition-colors",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:opacity-50",
              )}
              placeholder="······"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Yeni PIN (4 hane)</label>
            <PinInput value={newPin} onChange={setNewPin} disabled={pending} ariaLabel="Yeni PIN" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Yeni PIN (tekrar)</label>
            <PinInput
              value={confirm}
              onChange={setConfirm}
              disabled={pending}
              ariaLabel="Yeni PIN tekrar"
              onEnter={confirmReset}
            />
          </div>
          <button
            type="button"
            onClick={confirmReset}
            disabled={pending}
            className={buttonClass("primary", "md")}
          >
            {pending ? "İşleniyor…" : "Yeni PIN'i kaydet"}
          </button>
          <button
            type="button"
            onClick={requestCode}
            disabled={pending}
            className="text-xs text-muted-foreground underline-offset-2 hover:underline disabled:opacity-50"
          >
            Kodu tekrar gönder
          </button>
        </>
      )}

      {info && <p className="text-sm text-secondary">{info}</p>}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          className="text-xs text-muted-foreground underline-offset-2 hover:underline disabled:opacity-50"
        >
          Geri dön
        </button>
      )}
    </div>
  );
}
