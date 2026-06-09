"use client";

// Ayarlar — güvenlik bölümü (client). docs/05 "Boşta Kilit / PIN".
//   1) Kilit süresi: select (5/15/30/60 dk / Kapalı) → updateLockTimeoutAction.
//   2) PIN değiştir: eski + yeni + doğrulama → changePinAction.
//   3) PIN'i unuttum: e-posta kod akışı (ForgotPinFlow) ile sıfırla.
// Tüm doğrulama sunucuda; bu bileşen yalnız form + net başarı/hata mesajı.

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, buttonClass } from "@/components/ui";
import { PinInput } from "@/components/pin-input";
import { ForgotPinFlow } from "@/components/forgot-pin-flow";
import { updateLockTimeoutAction, changePinAction } from "@/app/security-actions";

const LOCK_OPTIONS = [
  { value: 5, label: "5 dakika" },
  { value: 15, label: "15 dakika" },
  { value: 30, label: "30 dakika" },
  { value: 60, label: "60 dakika" },
  { value: 0, label: "Kapalı" },
];

interface SecuritySettingsProps {
  initialLockTimeout: number;
  hasPin: boolean;
}

export function SecuritySettings({ initialLockTimeout, hasPin }: SecuritySettingsProps) {
  return (
    <div className="flex flex-col gap-6">
      <LockTimeoutCard initial={initialLockTimeout} />
      <ChangePinCard hasPin={hasPin} />
    </div>
  );
}

// ───────────────────────────── Kilit süresi ─────────────────────────────

function LockTimeoutCard({ initial }: { initial: number }) {
  const [value, setValue] = useState(initial);
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save(next: number) {
    setValue(next);
    setPending(true);
    setMsg(null);
    setError(null);
    try {
      const res = await updateLockTimeoutAction(next);
      if (res.ok) {
        setMsg(res.message ?? "Kaydedildi.");
      } else {
        setError(res.error);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Otomatik kilit</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          Panel bu süre boyunca boşta kalınca PIN ile kilitlenir. &ldquo;Kapalı&rdquo; seçilirse
          otomatik kilit devre dışı kalır.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="lock-timeout" className="text-sm font-medium">
            Kilit süresi
          </label>
          <select
            id="lock-timeout"
            value={value}
            disabled={pending}
            onChange={(e) => save(Number(e.target.value))}
            className="rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:opacity-50"
          >
            {LOCK_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        {msg && <p className="text-sm text-secondary">{msg}</p>}
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ───────────────────────────── PIN değiştir / sıfırla ─────────────────────────────

function ChangePinCard({ hasPin }: { hasPin: boolean }) {
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForgot, setShowForgot] = useState(false);

  async function submit() {
    if (pending) return;
    setPending(true);
    setMsg(null);
    setError(null);
    try {
      const fd = new FormData();
      fd.set("oldPin", oldPin);
      fd.set("newPin", newPin);
      fd.set("confirm", confirm);
      const res = await changePinAction(fd);
      if (res.ok) {
        setMsg(res.message ?? "PIN güncellendi.");
        setOldPin("");
        setNewPin("");
        setConfirm("");
      } else {
        setError(res.error);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>PIN değiştir</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {!hasPin ? (
          <p className="text-sm text-muted-foreground">
            Henüz bir PIN oluşturulmamış. PIN, panele ilk girişte istenir.
          </p>
        ) : showForgot ? (
          <ForgotPinFlow
            onSuccess={() => {
              setShowForgot(false);
              setMsg("Yeni PIN oluşturuldu.");
            }}
            onCancel={() => setShowForgot(false)}
          />
        ) : (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Mevcut PIN</label>
              <PinInput
                value={oldPin}
                onChange={setOldPin}
                disabled={pending}
                ariaLabel="Mevcut PIN"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Yeni PIN (4 hane)</label>
              <PinInput
                value={newPin}
                onChange={setNewPin}
                disabled={pending}
                ariaLabel="Yeni PIN"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Yeni PIN (tekrar)</label>
              <PinInput
                value={confirm}
                onChange={setConfirm}
                disabled={pending}
                ariaLabel="Yeni PIN tekrar"
                onEnter={submit}
              />
            </div>

            {msg && <p className="text-sm text-secondary">{msg}</p>}
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={submit}
                disabled={pending}
                className={buttonClass("primary", "sm")}
              >
                {pending ? "Kaydediliyor…" : "PIN'i güncelle"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMsg(null);
                  setShowForgot(true);
                }}
                disabled={pending}
                className="text-xs text-muted-foreground underline-offset-2 hover:underline disabled:opacity-50"
              >
                PIN&apos;i unuttum
              </button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
