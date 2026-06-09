"use client";

// PIN kilit yöneticisi — korumalı layout'a yerleştirilir. docs/05 "Boşta Kilit / PIN".
//
// Üç görev:
//   1) İlk giriş: hasPin=false ise KAPATILAMAZ kurulum modalı (4 haneli PIN + neden açıklaması).
//   2) Boşta kilit: lockTimeoutMinutes>0 ise kullanıcı etkinliğini izle; süre dolunca tam
//      ekran kilit overlay göster. Sayfa yeniden yüklenince son-etkinlikten (localStorage)
//      bu yana süre dolduysa KİLİTLİ başla.
//   3) Kilit açma: PIN doğrulama (sunucuda). 5 yanlış → tam çıkış (sunucu yapar). "PIN'i
//      unuttum" → e-posta kodu alt-akışı. "Tam çıkış" → signOut.
//
// GÜVENLİK: Bu yalnız UI gate'tir; oturum JWT geçerli kalır. PIN doğrulaması her zaman
// SUNUCUDA (unlockAction). localStorage'daki zaman güvenlik kararı DEĞİL, yalnız UX
// (yeniden yüklemede kilit durumunu hatırlamak) içindir.

import { useCallback, useEffect, useState } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { buttonClass } from "@/components/ui";
import { PinInput } from "@/components/pin-input";
import { ForgotPinFlow } from "@/components/forgot-pin-flow";
import { setupPinAction, unlockAction } from "@/app/security-actions";
import { signOutAction } from "@/app/actions";

interface PinLockGuardProps {
  hasPin: boolean;
  lockTimeoutMinutes: number;
  email: string;
}

/** Son etkinlik zamanını yeniden yüklemeler arası tutar (yalnız UX; güvenlik değil). */
const LAST_ACTIVITY_KEY = "admin_last_activity";
const ACTIVITY_EVENTS = ["mousemove", "keydown", "click", "scroll", "touchstart"] as const;

function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!domain || !name) return email;
  const head = name.slice(0, 1);
  const tail = name.length > 2 ? name.slice(-1) : "";
  return `${head}***${tail}@${domain}`;
}

export function PinLockGuard({ hasPin, lockTimeoutMinutes, email }: PinLockGuardProps) {
  // PIN durumu — kurulum sonrası true olur (modal kapanır, kilit izleme başlar).
  const [pinSet, setPinSet] = useState(hasPin);
  // Kilit overlay görünür mü?
  const [locked, setLocked] = useState(false);

  const lockTimeoutMs = lockTimeoutMinutes > 0 ? lockTimeoutMinutes * 60 * 1000 : 0;

  const recordActivity = useCallback(() => {
    try {
      localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
    } catch {
      /* localStorage erişilemez (gizli mod vb.) — yoksay */
    }
  }, []);

  // Yeniden yüklemede: son etkinlikten bu yana süre dolduysa kilitli başla.
  useEffect(() => {
    if (!pinSet || lockTimeoutMs === 0) return;
    let last = 0;
    try {
      last = Number(localStorage.getItem(LAST_ACTIVITY_KEY) ?? "0");
    } catch {
      last = 0;
    }
    if (last > 0 && Date.now() - last >= lockTimeoutMs) {
      setLocked(true);
    } else {
      recordActivity();
    }
  }, [pinSet, lockTimeoutMs, recordActivity]);

  // Boşta izleme: etkinlikte son-etkinliği güncelle; her saniye süreyi kontrol et.
  useEffect(() => {
    if (!pinSet || lockTimeoutMs === 0 || locked) return;

    const onActivity = () => recordActivity();
    for (const ev of ACTIVITY_EVENTS) {
      window.addEventListener(ev, onActivity, { passive: true });
    }

    const interval = window.setInterval(() => {
      let last = 0;
      try {
        last = Number(localStorage.getItem(LAST_ACTIVITY_KEY) ?? "0");
      } catch {
        last = Date.now();
      }
      if (last > 0 && Date.now() - last >= lockTimeoutMs) {
        setLocked(true);
      }
    }, 1000);

    return () => {
      for (const ev of ACTIVITY_EVENTS) window.removeEventListener(ev, onActivity);
      window.clearInterval(interval);
    };
  }, [pinSet, lockTimeoutMs, locked, recordActivity]);

  // Kilitliyken arka plan kaydırması kilitli (içerik görünmez/etkileşilemez overlay altında).
  useEffect(() => {
    if (!locked && pinSet) return;
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [locked, pinSet]);

  const onUnlocked = useCallback(() => {
    setLocked(false);
    recordActivity();
  }, [recordActivity]);

  // İlk giriş: kurulum modalı (kapatılamaz).
  if (!pinSet) {
    return <SetupPinModal onDone={() => setPinSet(true)} />;
  }

  if (!locked) return null;

  return <LockOverlay email={email} onUnlocked={onUnlocked} />;
}

// ───────────────────────────── İlk-giriş kurulum modalı ─────────────────────────────

function SetupPinModal({ onDone }: { onDone: () => void }) {
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  async function submit() {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.set("pin", pin);
      fd.set("confirm", confirm);
      const res = await setupPinAction(fd);
      if (res.ok) {
        onDone();
      } else {
        setError(res.error);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pin-setup-title"
      aria-describedby="pin-setup-desc"
      className="fixed inset-0 z-[120] flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm"
    >
      <div className="flex w-full max-w-md flex-col gap-5 rounded-[var(--radius)] border border-border bg-card p-6 shadow-xl">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" aria-hidden />
          <h2 id="pin-setup-title" className="font-heading text-lg font-semibold">
            Hızlı kilit PIN&apos;i oluşturun
          </h2>
        </div>
        <p id="pin-setup-desc" className="text-sm text-muted-foreground">
          Hesabınızı korumak için 4 haneli bir kod belirleyin. Panel bir süre boşta kalınca bu kodla
          hızlıca kilit açarsınız — şifrenizi tekrar girmenize gerek kalmaz.
        </p>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="setup-pin" className="text-xs font-medium text-muted-foreground">
            PIN (4 hane)
          </label>
          <PinInput
            id="setup-pin"
            value={pin}
            onChange={setPin}
            autoFocus
            disabled={pending}
            ariaLabel="PIN"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="setup-confirm" className="text-xs font-medium text-muted-foreground">
            PIN (tekrar)
          </label>
          <PinInput
            id="setup-confirm"
            value={confirm}
            onChange={setConfirm}
            disabled={pending}
            ariaLabel="PIN tekrar"
            onEnter={submit}
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className={buttonClass("primary", "md")}
        >
          {pending ? "Kaydediliyor…" : "PIN'i oluştur"}
        </button>
      </div>
    </div>
  );
}

// ───────────────────────────── Kilit overlay ─────────────────────────────

function LockOverlay({ email, onUnlocked }: { email: string; onUnlocked: () => void }) {
  const [pin, setPin] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgot, setShowForgot] = useState(false);

  async function unlock() {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.set("pin", pin);
      const res = await unlockAction(fd);
      if (res.ok) {
        onUnlocked();
      } else {
        // signOut başarısız/ulaşılamadıysa istemci de güvenli tarafta kalsın.
        if ("signOut" in res && res.signOut) {
          window.location.href = "/login";
          return;
        }
        setPin("");
        setError(res.error);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pin-lock-title"
      className="fixed inset-0 z-[120] flex items-center justify-center bg-background/95 p-4 backdrop-blur-md"
    >
      <div className="flex w-full max-w-md flex-col gap-5 rounded-[var(--radius)] border border-border bg-card p-6 shadow-xl">
        <div className="flex items-center gap-2">
          <Lock className="h-6 w-6 text-primary" aria-hidden />
          <h2 id="pin-lock-title" className="font-heading text-lg font-semibold">
            Panel kilitlendi
          </h2>
        </div>

        {!showForgot ? (
          <>
            <p className="text-sm text-muted-foreground">
              Devam etmek için PIN&apos;inizi girin.{" "}
              <span className="text-foreground">{maskEmail(email)}</span>
            </p>

            <PinInput
              value={pin}
              onChange={setPin}
              autoFocus
              disabled={pending}
              ariaLabel="PIN"
              onEnter={unlock}
            />

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={unlock}
              disabled={pending}
              className={buttonClass("primary", "md")}
            >
              {pending ? "Açılıyor…" : "Kilidi aç"}
            </button>

            <div className="flex items-center justify-between gap-3 text-xs">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setShowForgot(true);
                }}
                disabled={pending}
                className="text-muted-foreground underline-offset-2 hover:underline disabled:opacity-50"
              >
                PIN&apos;i unuttum
              </button>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="text-muted-foreground underline-offset-2 hover:underline"
                >
                  Tam çıkış yap
                </button>
              </form>
            </div>
          </>
        ) : (
          <ForgotPinFlow onSuccess={onUnlocked} onCancel={() => setShowForgot(false)} />
        )}
      </div>
    </div>
  );
}
