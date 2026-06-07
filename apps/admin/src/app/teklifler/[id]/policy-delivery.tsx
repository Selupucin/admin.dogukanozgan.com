"use client";

// Poliçe Yükle & Gönder (K28+K32, docs/12 madde 9).
// Belge seç → uploadAndSendPolicyAction → Blob'a yüklenir + müşteriye "Poliçe Teslim"
// maili gönderilir (e-posta/depolama yapılandırması yoksa bilgilendirir).

import { useRef, useState, useTransition } from "react";
import { buttonClass } from "@/components/ui";
import { uploadAndSendPolicyAction } from "./actions";

export function PolicyDelivery({
  quoteId,
  hasEmail,
  emailConfigured,
  storageConfigured,
}: {
  quoteId: string;
  hasEmail: boolean;
  emailConfigured: boolean;
  storageConfigured: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function submit() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Önce bir belge seçin.");
      return;
    }
    setError(null);
    setNotice(null);
    const fd = new FormData();
    fd.set("file", file);
    startTransition(async () => {
      const res = await uploadAndSendPolicyAction(quoteId, fd);
      if (!res.ok) setError(res.error ?? "İşlem başarısız.");
      else {
        setNotice(res.notice ?? "Belge yüklendi.");
        if (fileRef.current) fileRef.current.value = "";
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Poliçe belgesini yükleyin; müşteri e-postası varsa otomatik gönderilir.
      </p>

      {!storageConfigured && (
        <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
          Depolama yapılandırılmadı — yükleme yapılamaz (BLOB_READ_WRITE_TOKEN eksik).
        </p>
      )}
      {!hasEmail && (
        <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
          Müşteri e-postası yok — belge yüklenir ama mail gönderilmez.
        </p>
      )}
      {hasEmail && !emailConfigured && (
        <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
          E-posta yapılandırılmadı — belge yüklenir ama mail gönderilmez.
        </p>
      )}

      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/*"
        disabled={pending || !storageConfigured}
        className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-muted file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground hover:file:bg-muted/70"
      />

      <div>
        <button
          type="button"
          onClick={submit}
          disabled={pending || !storageConfigured}
          className={buttonClass("secondary", "sm")}
        >
          {pending ? "Gönderiliyor…" : "Poliçe Yükle & Gönder"}
        </button>
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {notice && <p className="text-sm text-secondary">{notice}</p>}
    </div>
  );
}
