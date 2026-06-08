"use client";

// CRM durum değiştirme kontrolü — açılır menü + uygula.
// Kaynak: docs/05 "CRM durumu: açılır menüden değiştir". Geçişler crm.ts ile sınırlı.
//
// AKIŞ KURALI (docs/05): POLICE_YAPILDI, önce TEKLIF_VERILDI yapılmadan SEÇİLEMEZ.
// Bu nedenle POLICE_YAPILDI seçeneği, mevcut durum TEKLIF_VERILDI/POLICE_YAPILDI değilse
// "disabled + ipucu" gösterilir (allowedTransitions zaten listelemez; ek görünür ipucu
// için engelli öğe açıkça eklenir). Sunucu da updateStatusAction'da kuralı doğrular.
//
// TESLİM (docs/12 §2/§5): TEKLIF_VERILDI veya POLICE_YAPILDI işaretlenince bir TESLİM
// MODALI açılır (opsiyonel dosya + mesaj → müşteriye e-posta). Diğer durumlar doğrudan
// uygulanır. POLICE_YAPILDI'da poliçe başlangıç + bitiş tarihi ZORUNLU (K32).

import { useMemo, useState, useTransition } from "react";
import type { QuoteStatus } from "@do/db";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@do/ui";
import {
  STATUS_LABELS,
  allowedTransitions,
  transitionBlockedReason,
  deliveryKindForStatus,
} from "@/lib/crm";
import { buttonClass } from "@/components/ui";
import { updateStatusAction, deliverToCustomerAction } from "./actions";
import { DeliveryModal, type DeliverySubmit } from "./delivery-modal";

const dateClass =
  "rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground " +
  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background";

interface StatusControlProps {
  quoteId: string;
  current: QuoteStatus;
  /** Müşteri e-postası var mı? (teslim modalı uyarısı için) */
  hasEmail: boolean;
  emailConfigured: boolean;
  storageConfigured: boolean;
}

export function StatusControl({
  quoteId,
  current,
  hasEmail,
  emailConfigured,
  storageConfigured,
}: StatusControlProps) {
  // Seçilebilir hedefler + (engelliyse) POLICE_YAPILDI'yı görünür ipucu ile ekle.
  const options = useMemo(() => {
    const allowed = allowedTransitions(current);
    const list: { value: QuoteStatus; disabled: boolean; hint: string | null }[] = allowed.map(
      (s) => ({ value: s, disabled: false, hint: null }),
    );
    // POLICE_YAPILDI seçilemiyorsa (akış kuralı) yine de disabled göster (gizleme).
    if (!allowed.includes("POLICE_YAPILDI") && current !== "POLICE_YAPILDI") {
      const hint = transitionBlockedReason(current, "POLICE_YAPILDI");
      if (hint) list.push({ value: "POLICE_YAPILDI", disabled: true, hint });
    }
    return list;
  }, [current]);

  const [next, setNext] = useState<string>("");
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Teslim modalı durumu (TEKLIF_VERILDI / POLICE_YAPILDI işaretlenince).
  const [modalKind, setModalKind] = useState<"teklif" | "police" | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const target = next as QuoteStatus;
  const isDelivery = next ? deliveryKindForStatus(target) !== null : false;
  const needsDates = next === "POLICE_YAPILDI";

  if (options.length === 0) {
    return <p className="text-sm text-muted-foreground">Bu durumdan geçiş tanımlı değil.</p>;
  }

  // Teslim DIŞI durumlar: doğrudan uygula.
  function applyDirect() {
    if (!next) return;
    setError(null);
    startTransition(async () => {
      const res = await updateStatusAction(quoteId, next);
      if (!res.ok) setError(res.error ?? "İşlem başarısız.");
      else setNext("");
    });
  }

  // Teslim durumları: tarih (poliçe) doğrula → modal aç.
  function openDelivery() {
    if (!next) return;
    if (needsDates && (!start || !end)) {
      setError("Poliçe başlangıç ve bitiş tarihi zorunludur.");
      return;
    }
    setError(null);
    setModalError(null);
    setModalKind(deliveryKindForStatus(target));
  }

  function primaryAction() {
    if (isDelivery) openDelivery();
    else applyDirect();
  }

  // Modal "Gönder" / "Yalnız durumu güncelle" → teslim action'ı.
  function submitDelivery(data: DeliverySubmit) {
    setModalError(null);
    const fd = new FormData();
    fd.set("status", next);
    fd.set("message", data.message);
    fd.set("statusOnly", data.statusOnly ? "1" : "0");
    if (needsDates) {
      fd.set("policyStart", start);
      fd.set("policyEnd", end);
    }
    if (data.file) fd.set("file", data.file);

    startTransition(async () => {
      const res = await deliverToCustomerAction(quoteId, fd);
      if (!res.ok) {
        setModalError(res.error ?? "İşlem başarısız.");
        return;
      }
      // Başarılı — modalı kapat, seçimi temizle. (Sayfa revalidate edilir.)
      setModalKind(null);
      setNext("");
      setStart("");
      setEnd("");
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <Select value={next} onValueChange={setNext} disabled={pending}>
        <SelectTrigger className="min-h-[40px] py-2 text-sm" aria-label="Yeni durum seç">
          <SelectValue placeholder="Yeni durum seç…" />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem
              key={o.value}
              value={o.value}
              disabled={o.disabled}
              title={o.hint ?? undefined}
            >
              {STATUS_LABELS[o.value]}
              {o.disabled && o.hint ? ` — ${o.hint}` : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {needsDates && (
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground">
            Poliçe yapıldı — başlangıç ve bitiş tarihi girin (zorunlu).
          </p>
          <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
            Başlangıç
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className={dateClass}
              disabled={pending}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
            Bitiş
            <input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className={dateClass}
              disabled={pending}
            />
          </label>
        </div>
      )}

      <button
        type="button"
        onClick={primaryAction}
        disabled={!next || pending}
        className={buttonClass("primary", "sm")}
      >
        {pending ? "İşleniyor…" : isDelivery ? "Devam — Müşteriye Gönder…" : "Durumu Güncelle"}
      </button>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      {modalKind && (
        <DeliveryModal
          kind={modalKind}
          hasEmail={hasEmail}
          emailConfigured={emailConfigured}
          storageConfigured={storageConfigured}
          pending={pending}
          error={modalError}
          onClose={() => {
            if (pending) return;
            setModalKind(null);
            setModalError(null);
          }}
          onSubmit={submitDelivery}
        />
      )}
    </div>
  );
}
