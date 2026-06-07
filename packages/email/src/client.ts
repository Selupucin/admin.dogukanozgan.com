// @do/email — Resend istemcisi + env-flag (feature flag). YALNIZCA SUNUCU.
// docs/12 K28: RESEND_API_KEY yoksa gönderim ZARİFÇE atlanır (akış kırılmaz —
// @do/db storage feature-flag deseniyle uyumlu).
//
// ⚠️ GÜVENLİK: RESEND_API_KEY YALNIZCA sunucuda kullanılır. Bu modül hiçbir zaman
// istemci bileşenine import EDİLMEMELİDİR ("server-only" sınırı).

import { Resend } from "resend";

/**
 * E-posta gönderimi yapılandırılmış mı? (feature flag)
 * RESEND_API_KEY varsa true. EMAIL_FROM yoksa güvenli bir varsayılana düşülür.
 */
export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

/** Gönderen adresi (EMAIL_FROM) — tanımlı değilse makul varsayılan. */
export function getFromAddress(): string {
  // TODO(doc): Nihai gönderen adresi/alan doğrulaması Doğukan'da (docs/12 §5).
  return process.env.EMAIL_FROM ?? "Doğukan Özgan <teklif@dogukanozgan.com>";
}

let cached: Resend | undefined;

/**
 * Tekil Resend istemcisi. Yapılandırılmamışsa null döner (çağıran feature-flag
 * ile zarifçe atlamalı).
 */
export function getResend(): Resend | null {
  if (!isEmailConfigured()) return null;
  if (!cached) {
    cached = new Resend(process.env.RESEND_API_KEY);
  }
  return cached;
}

/** Gönderim fonksiyonlarının ortak dönüş tipi. */
export interface SendResult {
  /** Gönderim başarılı mı? */
  ok: boolean;
  /** Yapılandırma yokluğundan ötürü atlandıysa true (hata DEĞİL). */
  skipped?: boolean;
  /** Resend mesaj kimliği (başarılıysa). */
  id?: string;
  /** Hata mesajı (başarısızsa; loglama için). */
  error?: string;
}
