"use client";

// Müşteriye Teslim modalı — durum TEKLIF_VERILDI / POLICE_YAPILDI işaretlenince açılır.
// Kaynak: docs/05 §3 (Poliçe gönder → genelleştirildi: teklif/poliçe teslim),
// docs/12 §2/§5 (CustomerDeliveryEmail: opsiyonel dosya + mesaj + durum linki).
//
// Erişilebilirlik (delete-confirm-modal / capture-guide-modal deseni): role="dialog" +
// aria-modal, focus tuzağı, ESC ile kapatma, açılınca odak, arka plan kaydırması kilitli.
//
// AKIŞ: Dosya + mesaj OPSİYONELDİR. Boş bırakılırsa müşteriye yalnız "hazırlandı"
// bilgilendirme e-postası gider. Müşteri e-postası yoksa mail gönderilemez; yalnız
// durumu güncelleme seçeneği sunulur. Tüm doğrulama SUNUCUDA (deliverToCustomerAction).

import { useEffect, useId, useRef, useState } from "react";
import { Send, X } from "lucide-react";
import { cn } from "@do/ui";
import { buttonClass } from "@/components/ui";

export type DeliveryKind = "teklif" | "police";

export interface DeliverySubmit {
  /** Seçilen belge (opsiyonel). */
  file: File | null;
  /** Müşteriye iletilecek serbest mesaj (opsiyonel). */
  message: string;
  /** true → durumu güncelle ama mail GÖNDERME (yalnız durum). */
  statusOnly: boolean;
}

interface DeliveryModalProps {
  kind: DeliveryKind;
  /** Müşterinin e-postası var mı? Yoksa mail gönderilemez. */
  hasEmail: boolean;
  /** E-posta altyapısı yapılandırıldı mı? (flag) */
  emailConfigured: boolean;
  /** Depolama (Blob) yapılandırıldı mı? (dosya yükleme için) */
  storageConfigured: boolean;
  /** "Gönder" / "Yalnız durumu güncelle" → üst bileşen action'ı tetikler. */
  onSubmit: (data: DeliverySubmit) => void;
  /** Vazgeç (X / ESC / backdrop) — durum DEĞİŞMEZ. */
  onClose: () => void;
  pending: boolean;
  error: string | null;
}

// İstemci tarafı ön-eleme (UX) — gerçek doğrulama sunucuda validateUpload ile.
const ACCEPT = ".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp";
const MAX_MB = 15;

export function DeliveryModal({
  kind,
  hasEmail,
  emailConfigured,
  storageConfigured,
  onSubmit,
  onClose,
  pending,
  error,
}: DeliveryModalProps) {
  const titleId = useId();
  const descId = useId();
  const msgId = useId();
  const fileId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [message, setMessage] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);

  const isPolicy = kind === "police";
  const title = isPolicy ? "Poliçeyi Müşteriye Gönder" : "Teklifi Müşteriye Gönder";
  const noun = isPolicy ? "Poliçe" : "Teklif";

  // Mail bu modalda fiilen gönderilebilir mi?
  const canMail = hasEmail && emailConfigured;

  // Açılışta: body scroll kilidi + odak ilk alana.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstFieldRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      if (pending) return;
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== "Tab") return;
    const root = dialogRef.current;
    if (!root) return;
    const focusables = root.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input:not([disabled]), select, [tabindex]:not([tabindex="-1"])',
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

  function onFileChange() {
    setClientError(null);
    const f = fileRef.current?.files?.[0];
    if (!f) {
      setFileName(null);
      return;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setClientError(`Dosya çok büyük (en fazla ${MAX_MB} MB).`);
      if (fileRef.current) fileRef.current.value = "";
      setFileName(null);
      return;
    }
    setFileName(f.name);
  }

  function buildSubmit(statusOnly: boolean): DeliverySubmit {
    const file = fileRef.current?.files?.[0] ?? null;
    return { file, message: message.trim(), statusOnly };
  }

  function send() {
    if (pending) return;
    // Dosya yüklenecekse depolama gerekir (sunucu da reddeder; burada erken uyar).
    if (fileRef.current?.files?.[0] && !storageConfigured) {
      setClientError("Depolama yapılandırılmadı — dosya yüklenemez. Dosyayı kaldırın.");
      return;
    }
    setClientError(null);
    onSubmit(buildSubmit(false));
  }

  function statusOnly() {
    if (pending) return;
    setClientError(null);
    onSubmit(buildSubmit(true));
  }

  const shownError = clientError ?? error;

  return (
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
        className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-t-[var(--radius)] border border-border bg-card shadow-xl outline-none sm:rounded-[var(--radius)]"
      >
        {/* Başlık */}
        <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
          <h2 id={titleId} className="flex items-center gap-2 font-heading text-lg">
            <Send className="h-5 w-5 text-primary" aria-hidden />
            {title}
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
            Dosya ve mesaj <span className="font-medium text-foreground">opsiyoneldir</span>. İkisi
            de boş bırakılırsa müşteriye yalnız &ldquo;hazırlandı&rdquo; bilgilendirme e-postası
            gider.
          </p>

          {/* E-posta yoksa uyarı */}
          {!hasEmail && (
            <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
              Müşterinin e-posta adresi yok — e-posta gönderilemez. Aşağıdan yalnız durumu
              güncelleyebilirsiniz.
            </p>
          )}
          {hasEmail && !emailConfigured && (
            <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
              E-posta altyapısı yapılandırılmadı (RESEND_API_KEY eksik) — durum güncellenir ama mail
              gönderilmez.
            </p>
          )}

          {/* Dosya */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor={fileId} className="text-xs font-medium text-muted-foreground">
              {noun} belgesi (opsiyonel — PDF veya görsel)
            </label>
            <input
              id={fileId}
              ref={fileRef}
              type="file"
              accept={ACCEPT}
              disabled={pending || !storageConfigured}
              onChange={onFileChange}
              className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-muted file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground hover:file:bg-muted/70 disabled:opacity-50"
            />
            {!storageConfigured && (
              <p className="text-xs text-muted-foreground">
                Depolama yapılandırılmadı (BLOB_READ_WRITE_TOKEN eksik) — dosya yüklenemez; yalnız
                mesaj/bilgilendirme gönderilebilir.
              </p>
            )}
            {fileName && (
              <p className="text-xs text-secondary">
                Seçili: <span className="font-medium">{fileName}</span> — maile ek olarak gider.
              </p>
            )}
          </div>

          {/* Mesaj */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor={msgId} className="text-xs font-medium text-muted-foreground">
              Müşteriye not (opsiyonel)
            </label>
            <textarea
              id={msgId}
              ref={firstFieldRef}
              value={message}
              disabled={pending}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              maxLength={3000}
              placeholder="Örn. Teklifiniz ekte. Sorularınız için bize ulaşabilirsiniz."
              className={cn(
                "rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition-colors",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                "disabled:opacity-50",
              )}
            />
          </div>

          {shownError && (
            <p role="alert" className="text-sm text-destructive">
              {shownError}
            </p>
          )}
        </div>

        {/* Aksiyonlar */}
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className={buttonClass("outline", "sm")}
          >
            Vazgeç
          </button>
          {/* "Yalnız durumu güncelle" — mail gönderemediğimizde veya admin istemezse. */}
          <button
            type="button"
            onClick={statusOnly}
            disabled={pending}
            className={buttonClass("secondary", "sm")}
          >
            {pending ? "İşleniyor…" : "Mail gönderme, sadece durumu güncelle"}
          </button>
          <button
            type="button"
            onClick={send}
            disabled={pending || !canMail}
            title={!canMail ? "Müşteri e-postası / e-posta altyapısı yok" : undefined}
            className={buttonClass("primary", "sm")}
          >
            {pending ? "Gönderiliyor…" : "Gönder"}
          </button>
        </div>
      </div>
    </div>
  );
}
