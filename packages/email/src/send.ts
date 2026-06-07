// @do/email — Gönderim fonksiyonları (Resend). YALNIZCA SUNUCU.
// docs/12 K28: env-flag'li; anahtar yoksa no-op { ok:false, skipped:true }.
// Hata YUTULUR + loglanır, akış kırılmaz; { ok } döner.
//
// Bu fonksiyonlar başka app'lerden (apps/web teklif action'ı, apps/admin poliçe
// gönder action'ı) import edilip çağrılır (Faz 2). Onları BU paket yazmaz.

import { render } from "@react-email/render";
import { getResend, getFromAddress, isEmailConfigured, type SendResult } from "./client";
import { QuoteReceivedEmail } from "./templates/QuoteReceivedEmail";
import { PolicyDeliveryEmail } from "./templates/PolicyDeliveryEmail";
import { normalizeLocale, quoteReceivedStrings, policyDeliveryStrings } from "./lib/i18n";

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

export interface SendPolicyDeliveryInput {
  /** Alıcı e-posta adresi. */
  to: string;
  /** Ürün adı (görünen). */
  productName: string;
  /** Poliçe belgesi tam URL'i. */
  policyUrl: string;
  /** "tr" | "en" (varsayılan tr). */
  locale?: string;
}

/**
 * "Poliçe Teslim" e-postası gönderir (müşteriye). Yapılandırma yoksa atlar.
 */
export async function sendPolicyDelivery(input: SendPolicyDeliveryInput): Promise<SendResult> {
  const locale = normalizeLocale(input.locale);
  const resend = getResend();
  if (!resend) {
    return { ok: false, skipped: true };
  }

  try {
    const element = PolicyDeliveryEmail({
      productName: input.productName,
      policyUrl: input.policyUrl,
      locale,
    });
    const html = await render(element);
    const text = await render(element, { plainText: true });

    const { data, error } = await resend.emails.send({
      from: getFromAddress(),
      to: input.to,
      subject: policyDeliveryStrings[locale].subject(input.productName),
      html,
      text,
    });

    if (error) {
      console.error("[@do/email] sendPolicyDelivery failed:", error);
      return { ok: false, error: error.message };
    }
    return { ok: true, id: data?.id };
  } catch (err) {
    console.error("[@do/email] sendPolicyDelivery threw:", err);
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// Yeniden ihraç (çağıranların flag kontrolü yapabilmesi için).
export { isEmailConfigured };
