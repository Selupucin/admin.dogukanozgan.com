// @do/email — Paylaşımlı e-posta katmanı (Resend + React Email). — K28
// docs/12 §2. YALNIZCA SUNUCU (RESEND_API_KEY gizli anahtarı içerir).
//
// Dışa aktarılan API:
//   sendQuoteReceived({ to, productName, code, statusUrl, locale })            -> SendResult
//   sendCustomerDelivery({ to, kind, productName, message?, attachment?,
//                          statusUrl?, locale })                               -> SendResult
//   sendPolicyDelivery({ to, productName, policyUrl?, attachment?, message?,
//                        locale })  (geriye uyum → sendCustomerDelivery)       -> SendResult
//   isEmailConfigured()  -> boolean (feature flag)
//
// Faz 2: apps/web teklif action'ı + apps/admin teslim (teklif/poliçe gönder) action'ı
// bunları çağırır.

export {
  sendQuoteReceived,
  sendCustomerDelivery,
  sendPolicyDelivery,
  isEmailConfigured,
  type SendQuoteReceivedInput,
  type SendCustomerDeliveryInput,
  type SendPolicyDeliveryInput,
  type EmailAttachment,
} from "./send";

export { getFromAddress, type SendResult } from "./client";

// Şablonlar (önizleme/test veya özel kullanım için).
export { EmailLayout } from "./templates/EmailLayout";
export { QuoteReceivedEmail, type QuoteReceivedEmailProps } from "./templates/QuoteReceivedEmail";
export {
  CustomerDeliveryEmail,
  type CustomerDeliveryEmailProps,
} from "./templates/CustomerDeliveryEmail";
// Geriye uyum: eski "Poliçe Teslim" şablonu hâlâ dışa aktarılır (artık send.ts
// CustomerDeliveryEmail kullanır; bu yalnız doğrudan/önizleme kullanımı içindir).
export {
  PolicyDeliveryEmail,
  type PolicyDeliveryEmailProps,
} from "./templates/PolicyDeliveryEmail";

export { normalizeLocale, type Locale, type DeliveryKind } from "./lib/i18n";
