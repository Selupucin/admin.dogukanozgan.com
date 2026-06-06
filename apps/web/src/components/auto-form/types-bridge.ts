// Auto-form ↔ @do/products köprüsü. Tüm ürün tipleri tek yerden re-export edilir,
// böylece bileşenler doğrudan @do/products'a değil bu köprüye bağlanır.
export type {
  ProductField,
  ProductDefinition,
  FieldType,
  FieldOption,
  LocalizedText,
} from "@do/products";

import type { routing } from "@/i18n/routing";

export type Locale = (typeof routing.locales)[number];
