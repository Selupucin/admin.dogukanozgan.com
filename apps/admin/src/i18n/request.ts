import { getRequestConfig } from "next-intl/server";

// Admin sabit locale (TR) ile çalışır; locale-prefixed rota yok (docs/01).
// Çok dilli admin gerekirse buradan genişletilebilir.
// TODO(doc): Admin'de dil seçimi istenirse docs/07 ile netleştir.
const locale = "tr";

export default getRequestConfig(async () => {
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
