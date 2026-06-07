// @do/email — Paylaşımlı e-posta katmanı (Resend + React Email). — K28
// docs/12 §2. YALNIZCA SUNUCU (RESEND_API_KEY gizli anahtarı içerir).
//
// Dışa aktarılan API:
//   sendQuoteReceived({ to, productName, code, statusUrl, locale })  -> SendResult
//   sendPolicyDelivery({ to, productName, policyUrl, locale })       -> SendResult
//   isEmailConfigured()  -> boolean (feature flag)
//
// Faz 2: apps/web teklif action'ı + apps/admin poliçe-gönder action'ı bunları çağırır.

export {
  sendQuoteReceived,
  sendPolicyDelivery,
  isEmailConfigured,
  type SendQuoteReceivedInput,
  type SendPolicyDeliveryInput,
} from "./send";

export { getFromAddress, type SendResult } from "./client";

// Şablonlar (önizleme/test veya özel kullanım için).
export { EmailLayout } from "./templates/EmailLayout";
export { QuoteReceivedEmail, type QuoteReceivedEmailProps } from "./templates/QuoteReceivedEmail";
export {
  PolicyDeliveryEmail,
  type PolicyDeliveryEmailProps,
} from "./templates/PolicyDeliveryEmail";

export { normalizeLocale, type Locale } from "./lib/i18n";
