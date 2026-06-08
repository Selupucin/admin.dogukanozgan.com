// @do/email — Gönderim fonksiyonları (Resend). YALNIZCA SUNUCU.
// docs/12 K28: env-flag'li; anahtar yoksa no-op { ok:false, skipped:true }.
// Hata YUTULUR + loglanır, akış kırılmaz; { ok } döner.
//
// Bu fonksiyonlar başka app'lerden (apps/web teklif action'ı, apps/admin poliçe
// gönder action'ı) import edilip çağrılır (Faz 2). Onları BU paket yazmaz.

import { render } from "@react-email/render";
import { getResend, getFromAddress, isEmailConfigured, type SendResult } from "./client";
import { QuoteReceivedEmail } from "./templates/QuoteReceivedEmail";
import { CustomerDeliveryEmail } from "./templates/CustomerDeliveryEmail";
import {
  normalizeLocale,
  quoteReceivedStrings,
  customerDeliveryStrings,
  type DeliveryKind,
} from "./lib/i18n";

export interface SendQuoteReceivedInput {
  /** Alıcı e-posta adresi. */
  to: string;
  /** Ürün adı (görünen). */
  productName: string;
  /** Durum-takip kodu (K30). */
  code: string;
  /** Durum sorgu sayfası tam URL'i (locale dahil). */
  statusUrl: string;
  /** "tr" | "en" (varsayılan tr). */
  locale?: string;
}

/**
 * "Teklif Alındı" e-postası gönderir (müşteriye). Yapılandırma yoksa atlar.
 */
export async function sendQuoteReceived(input: SendQuoteReceivedInput): Promise<SendResult> {
  const locale = normalizeLocale(input.locale);
  const resend = getResend();
  if (!resend) {
    return { ok: false, skipped: true };
  }

  try {
    const element = QuoteReceivedEmail({
      productName: input.productName,
      code: input.code,
      statusUrl: input.statusUrl,
      locale,
    });
    const html = await render(element);
    const text = await render(element, { plainText: true });

    const { data, error } = await resend.emails.send({
      from: getFromAddress(),
      to: input.to,
      subject: quoteReceivedStrings[locale].subject(input.productName),
      html,
      text,
    });

    if (error) {
      console.error("[@do/email] sendQuoteReceived failed:", error);
      return { ok: false, error: error.message };
    }
    return { ok: true, id: data?.id };
  } catch (err) {
    console.error("[@do/email] sendQuoteReceived threw:", err);
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * E-posta eki (attachment). `content` ham bayttır; Resend'e base64 olarak iletilir.
 * KVKK: yalnızca veri sahibinin KENDİ belgesi (teklif/poliçe PDF'i) eklenmelidir (docs/06).
 */
export interface EmailAttachment {
  /** Dosya adı (görünen), örn. "police.pdf". */
  filename: string;
  /** Dosya içeriği (ham bayt). Resend'e base64'e çevrilerek gönderilir. */
  content: Buffer | Uint8Array;
  /** MIME türü, örn. "application/pdf". */
  contentType: string;
}

export interface SendCustomerDeliveryInput {
  /** Alıcı e-posta adresi. */
  to: string;
  /** Teslim türü: "teklif" (Teklifiniz hazırlandı) | "police" (Poliçeniz hazır). */
  kind: DeliveryKind;
  /** Ürün adı (görünen). */
  productName: string;
  /** Admin'in girdiği serbest mesaj (opsiyonel). Varsa "Acentenizden not" bloğunda. */
  message?: string;
  /** E-postaya iliştirilecek belge (opsiyonel). Varsa Resend `attachments` ile gider. */
  attachment?: EmailAttachment;
  /** Durum sorgu/görüntüleme sayfası tam URL'i (opsiyonel). */
  statusUrl?: string;
  /** "tr" | "en" (varsayılan tr). */
  locale?: string;
}

/**
 * Müşteriye teslim e-postası gönderir (genel). `kind` ile teklif/poliçe varyantı seçilir.
 * Ek dosya + serbest mesaj + durum linki opsiyoneldir; içerik yoksa standart "hazırlandı"
 * bildirimi gider. Yapılandırma yoksa zarifçe atlar ({ ok:false, skipped:true }).
 */
export async function sendCustomerDelivery(input: SendCustomerDeliveryInput): Promise<SendResult> {
  const locale = normalizeLocale(input.locale);
  const resend = getResend();
  if (!resend) {
    return { ok: false, skipped: true };
  }

  try {
    const element = CustomerDeliveryEmail({
      kind: input.kind,
      productName: input.productName,
      message: input.message,
      hasAttachment: Boolean(input.attachment),
      statusUrl: input.statusUrl,
      locale,
    });
    const html = await render(element);
    const text = await render(element, { plainText: true });

    // Resend attachments: ham baytı base64 string'e çevir.
    const attachments = input.attachment
      ? [
          {
            filename: input.attachment.filename,
            content: Buffer.from(input.attachment.content).toString("base64"),
            contentType: input.attachment.contentType,
          },
        ]
      : undefined;

    const { data, error } = await resend.emails.send({
      from: getFromAddress(),
      to: input.to,
      subject: customerDeliveryStrings[locale].subject(input.kind, input.productName),
      html,
      text,
      attachments,
    });

    if (error) {
      console.error("[@do/email] sendCustomerDelivery failed:", error);
      return { ok: false, error: error.message };
    }
    return { ok: true, id: data?.id };
  } catch (err) {
    console.error("[@do/email] sendCustomerDelivery threw:", err);
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export interface SendPolicyDeliveryInput {
  /** Alıcı e-posta adresi. */
  to: string;
  /** Ürün adı (görünen). */
  productName: string;
  /** Poliçe belgesi tam URL'i (opsiyonel — durum/görüntüleme linki olarak kullanılır). */
  policyUrl?: string;
  /** E-postaya iliştirilecek poliçe belgesi (opsiyonel). */
  attachment?: EmailAttachment;
  /** Admin'in girdiği serbest mesaj (opsiyonel). */
  message?: string;
  /** "tr" | "en" (varsayılan tr). */
  locale?: string;
}

/**
 * "Poliçe Teslim" e-postası gönderir (müşteriye). Geriye uyum için korunur;
 * `sendCustomerDelivery({ kind: "police", ... })` çağrısına delege eder.
 */
export async function sendPolicyDelivery(input: SendPolicyDeliveryInput): Promise<SendResult> {
  return sendCustomerDelivery({
    to: input.to,
    kind: "police",
    productName: input.productName,
    message: input.message,
    attachment: input.attachment,
    statusUrl: input.policyUrl,
    locale: input.locale,
  });
}

// Yeniden ihraç (çağıranların flag kontrolü yapabilmesi için).
export { isEmailConfigured };
