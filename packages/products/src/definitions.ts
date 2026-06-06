// @do/products — ürün tanımları (TEK KAYNAK, A yaklaşımı).
// Kaynak: docs/01 "A Yaklaşımı", docs/03 (ürün/form alanları), docs/02 (slug/rota).
//
// ⚠️ Aşama 1: Aşağıdaki ürünler ve form alanları docs/03'teki TASLAK tablolara
// göre tanımlanmıştır. Nihai (gerçek) alanlar Doğukan'dan gelince güncellenecek.
// Yeni ürün eklemek = bu nesneye yeni bir kayıt eklemek. Her // TODO(doc):
// işareti, dökümanda "netleşecek" olarak işaretli noktayı belirtir.

import type { ProductDefinition, ProductCatalog, ProductField, LocalizedSlug } from "./types";

/** Desteklenen diller (slug eşlemesi için). docs/07. */
export type ProductLocale = keyof LocalizedSlug; // "tr" | "en"

// ─────────────────────────────────────────────────────────────────────────────
// Ortak alanlar (docs/03 "Ortak Kurallar — Tüm Formlarda")
// Ad Soyad + Telefon zorunlu, E-posta opsiyonel.
// NOT: KVKK rıza kutusu(ları) form alanı OLARAK tutulmaz; AutoForm bileşeni
// üründeki `sensitive` bayrağına göre rıza kutularını otomatik ekler (docs/03/06).
// ─────────────────────────────────────────────────────────────────────────────

const adSoyad: ProductField = {
  name: "adSoyad",
  type: "text",
  required: true,
  label: { tr: "Ad Soyad", en: "Full Name" },
  placeholder: { tr: "Adınız ve soyadınız", en: "Your full name" },
  validation: { minLength: 2, maxLength: 80 },
};

const telefon: ProductField = {
  name: "telefon",
  type: "tel",
  required: true,
  label: { tr: "Telefon", en: "Phone" },
  placeholder: { tr: "05xx xxx xx xx", en: "05xx xxx xx xx" },
};

// docs/03 "🔧 netleşecek": e-posta zorunlu mu opsiyonel mi → şimdilik opsiyonel.
// TODO(doc): E-posta zorunluluğu netleşince `required` güncellenir.
const eposta: ProductField = {
  name: "eposta",
  type: "email",
  required: false,
  label: { tr: "E-posta", en: "Email" },
  placeholder: { tr: "ornek@eposta.com", en: "you@example.com" },
};

/** İl seçimi (docs'ta tam liste yok → yer tutucu kısa liste). */
// TODO(doc): Tam il listesi (81 il) veya gerçek hizmet bölgeleri eklenecek.
const il: ProductField = {
  name: "il",
  type: "select",
  required: true,
  label: { tr: "İl", en: "Province" },
  options: [
    { value: "istanbul", label: { tr: "İstanbul", en: "İstanbul" } },
    { value: "ankara", label: { tr: "Ankara", en: "Ankara" } },
    { value: "izmir", label: { tr: "İzmir", en: "İzmir" } },
    { value: "diger", label: { tr: "Diğer", en: "Other" } },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Ürünler (docs/03 ürün listesi — taslak alanlar)
// ─────────────────────────────────────────────────────────────────────────────

const trafik: ProductDefinition = {
  slug: "trafik", // docs/03 §1 (= slugs.tr, kanonik)
  slugs: { tr: "trafik", en: "traffic" }, // docs/03 slug eşleme tablosu
  name: { tr: "Trafik Sigortası", en: "Traffic Insurance" },
  description: {
    tr: "Zorunlu trafik sigortanız için 20+ şirketten en uygun teklifi karşılaştırın.",
    en: "Compare the most suitable offer from 20+ companies for your mandatory traffic insurance.",
  },
  icon: "Car",
  hasCalculator: false, // docs/03: fiyat resmî tarifeye bağlı, hesaplanamaz
  fields: [
    adSoyad,
    telefon,
    {
      name: "tcKimlik",
      type: "tcKimlik",
      required: true,
      label: { tr: "TC Kimlik No", en: "ID Number" },
      placeholder: { tr: "11 haneli", en: "11 digits" },
    },
    {
      name: "plaka",
      type: "plaka",
      required: true,
      label: { tr: "Plaka", en: "License Plate" },
      placeholder: { tr: "34 ABC 123", en: "34 ABC 123" },
    },
    {
      name: "dogumTarihi",
      type: "date",
      required: true,
      label: { tr: "Doğum Tarihi", en: "Date of Birth" },
    },
    {
      name: "ruhsatTarihi",
      type: "date",
      required: false,
      label: { tr: "Ruhsat / Tescil Tarihi", en: "Registration Date" },
    },
    // docs/03: fotoğraf yükleme VAR; zorunlu mu opsiyonel mi 🔧 netleşecek.
    // Upload MANTIĞI Aşama 2'de (Supabase Storage). Şimdilik alan TİPİ yer alır.
    // TODO(doc): Ruhsat fotoğrafı zorunlu mu? Aşama 2'de upload bağlanacak.
    {
      name: "ruhsatFoto",
      type: "file",
      required: false,
      label: { tr: "Ruhsat / Araç Fotoğrafı", en: "Registration / Vehicle Photo" },
      help: {
        tr: "Ruhsatınızın fotoğrafını yüklerseniz teklif süreci hızlanır.",
        en: "Uploading your registration photo speeds up the quote process.",
      },
      validation: { accept: "image/*", maxSizeMb: 10 },
    },
    eposta,
  ],
};

const saglik: ProductDefinition = {
  slug: "saglik", // docs/03 §2 (= slugs.tr, kanonik)
  slugs: { tr: "saglik", en: "health" }, // docs/03 slug eşleme tablosu
  name: { tr: "Sağlık Sigortası", en: "Health Insurance" },
  description: {
    tr: "Özel ve tamamlayıcı sağlık sigortasında size en uygun planı birlikte seçelim.",
    en: "Let's choose the most suitable private or complementary health plan together.",
  },
  icon: "HeartPulse",
  sensitive: true, // docs/03: kronik hastalık = özel nitelikli veri → 2. rıza
  hasCalculator: true,
  calculator: "saglik",
  fields: [
    adSoyad,
    telefon,
    {
      name: "dogumTarihi",
      type: "date",
      required: true,
      label: { tr: "Doğum Tarihi", en: "Date of Birth" },
      help: { tr: "Yaş hesaplaması için.", en: "Used to calculate age." },
    },
    {
      name: "cinsiyet",
      type: "radio",
      required: true,
      label: { tr: "Cinsiyet", en: "Gender" },
      options: [
        { value: "kadin", label: { tr: "Kadın", en: "Female" } },
        { value: "erkek", label: { tr: "Erkek", en: "Male" } },
      ],
    },
    {
      name: "sgk",
      type: "checkbox",
      required: true,
      label: { tr: "SGK'lı mıyım? (TSS/Özel ayrımı)", en: "Do I have SGK coverage? (TSS/Private)" },
    },
    {
      name: "sigara",
      type: "checkbox",
      required: false,
      label: { tr: "Sigara kullanıyorum", en: "I am a smoker" },
    },
    // Sağlık verisi (özel nitelikli) → sensitive: true.
    {
      name: "kronikHastalik",
      type: "radio",
      required: false,
      sensitive: true,
      label: { tr: "Mevcut kronik hastalık", en: "Existing chronic illness" },
      options: [
        { value: "yok", label: { tr: "Yok", en: "None" } },
        { value: "var", label: { tr: "Var", en: "Yes" } },
      ],
    },
    il,
    {
      name: "kapsam",
      type: "radio",
      required: true,
      label: { tr: "Kapsam", en: "Coverage" },
      options: [
        { value: "bireysel", label: { tr: "Bireysel", en: "Individual" } },
        { value: "aile", label: { tr: "Aile", en: "Family" } },
      ],
    },
    {
      name: "kisiSayisi",
      type: "number",
      required: false,
      label: { tr: "Aile ise kişi sayısı", en: "If family, number of people" },
      validation: { min: 1, max: 12 },
    },
  ],
};

const bireyselEmeklilik: ProductDefinition = {
  slug: "bireysel-emeklilik", // docs/03 §3 (= slugs.tr, kanonik)
  slugs: { tr: "bireysel-emeklilik", en: "private-pension" }, // docs/03 slug eşleme
  name: { tr: "Bireysel Emeklilik (BES)", en: "Private Pension (BES)" },
  description: {
    tr: "Devlet katkısıyla geleceğinizi bugünden planlayın; birikiminizi hesaplayın.",
    en: "Plan your future today with state contribution; calculate your savings.",
  },
  icon: "PiggyBank",
  hasCalculator: true,
  calculator: "bes",
  fields: [
    adSoyad,
    telefon,
    {
      name: "yas",
      type: "number",
      required: true,
      label: { tr: "Yaş", en: "Age" },
      validation: { min: 18, max: 99 },
    },
    {
      name: "aylikTutar",
      type: "number",
      required: true,
      label: { tr: "Aylık ödemek istenen tutar (TL)", en: "Desired monthly contribution (TRY)" },
      validation: { min: 0 },
    },
    {
      name: "hedef",
      type: "radio",
      required: false,
      label: { tr: "Hedef", en: "Goal" },
      options: [
        { value: "emeklilik", label: { tr: "Emeklilik", en: "Retirement" } },
        { value: "birikim", label: { tr: "Birikim", en: "Savings" } },
      ],
    },
  ],
};

const hayat: ProductDefinition = {
  slug: "hayat", // docs/03 §4 (= slugs.tr, kanonik)
  slugs: { tr: "hayat", en: "life" }, // docs/03 slug eşleme tablosu
  name: { tr: "Hayat Sigortası", en: "Life Insurance" },
  description: {
    tr: "Sevdiklerinizi güvence altına alın; teminat, süre ve yaşınıza göre teklifinizi alın.",
    en: "Protect your loved ones; get a quote based on coverage, term and your age.",
  },
  icon: "HeartHandshake",
  // docs/03 §4 Not: "Sağlık durumu" sorulursa özel nitelikli veri → 2. rıza.
  // Hayat sigortasında sigara/sağlık beyanı alındığından sensitive: true.
  sensitive: true,
  hasCalculator: true,
  calculator: "hayat",
  fields: [
    adSoyad,
    telefon,
    {
      name: "dogumTarihi",
      type: "date",
      required: true,
      label: { tr: "Doğum Tarihi", en: "Date of Birth" },
      help: { tr: "Yaş hesaplaması için.", en: "Used to calculate age." },
    },
    {
      name: "cinsiyet",
      type: "radio",
      required: false,
      label: { tr: "Cinsiyet", en: "Gender" },
      options: [
        { value: "kadin", label: { tr: "Kadın", en: "Female" } },
        { value: "erkek", label: { tr: "Erkek", en: "Male" } },
      ],
    },
    {
      name: "teminatTutari",
      type: "number",
      required: false,
      label: { tr: "Teminat tutarı (istenen, TL)", en: "Desired coverage amount (TRY)" },
      validation: { min: 0 },
    },
    {
      name: "sure",
      type: "number",
      required: false,
      label: { tr: "Süre (yıl)", en: "Term (years)" },
      validation: { min: 1, max: 40 },
    },
    {
      name: "amac",
      type: "radio",
      required: false,
      label: { tr: "Amaç", en: "Purpose" },
      options: [
        { value: "kredi", label: { tr: "Kredi", en: "Loan" } },
        { value: "birikim", label: { tr: "Birikim", en: "Savings" } },
        { value: "koruma", label: { tr: "Koruma", en: "Protection" } },
      ],
    },
    {
      name: "sigara",
      type: "checkbox",
      required: false,
      // Sağlık/yaşam tarzı beyanı → özel nitelikli veriye yakın; sensitive işaretli.
      sensitive: true,
      label: { tr: "Sigara kullanıyorum", en: "I am a smoker" },
    },
  ],
};

const konut: ProductDefinition = {
  slug: "konut", // docs/03 §5 (= slugs.tr, kanonik)
  // docs/03: EN slug "home-insurance" (yalın "home" anasayfayla karışmasın diye).
  slugs: { tr: "konut", en: "home-insurance" },
  name: { tr: "Konut Sigortası", en: "Home Insurance" },
  description: {
    tr: "Eviniz ve eşyalarınız için kapsamlı koruma; size özel teklif alın.",
    en: "Comprehensive protection for your home and belongings; get a tailored quote.",
  },
  icon: "Home",
  // docs/03: Konut hesaplayıcısı 🔧 netleşecek → şimdilik yok.
  // TODO(doc): Konut/DASK hesaplayıcısı istenirse Aşama 4'te eklenir.
  hasCalculator: false,
  fields: [
    adSoyad,
    telefon,
    il,
    {
      name: "brutM2",
      type: "number",
      required: true,
      label: { tr: "Brüt m²", en: "Gross m²" },
      validation: { min: 1, max: 2000 },
    },
    {
      name: "yapiTarzi",
      type: "select",
      required: true,
      label: { tr: "Yapı tarzı", en: "Construction type" },
      options: [
        { value: "betonarme", label: { tr: "Betonarme", en: "Reinforced concrete" } },
        { value: "yigma", label: { tr: "Yığma", en: "Masonry" } },
        { value: "celik", label: { tr: "Çelik", en: "Steel" } },
      ],
    },
    {
      name: "binaYasi",
      type: "number",
      required: true,
      label: { tr: "Bina yaşı / inşaat yılı", en: "Building age / construction year" },
      validation: { min: 0 },
    },
    {
      name: "kat",
      type: "number",
      required: false,
      label: { tr: "Bulunduğu kat", en: "Floor" },
    },
    {
      name: "mulkTipi",
      type: "radio",
      required: true,
      label: { tr: "Mülk tipi", en: "Property type" },
      options: [
        { value: "evSahibi", label: { tr: "Ev sahibi", en: "Owner" } },
        { value: "kiraci", label: { tr: "Kiracı", en: "Tenant" } },
      ],
    },
    {
      name: "esyaBedeli",
      type: "number",
      required: false,
      label: { tr: "Eşya bedeli (TL)", en: "Contents value (TRY)" },
      validation: { min: 0 },
    },
  ],
};

/**
 * Tüm sigorta ürünleri slug -> tanım eşlemesi.
 * Yeni ürün eklemek = buraya bir nesne eklemek (bkz. docs/01).
 * TODO(doc): Kasko, DASK, Ferdi Kaza, İş Yeri vb. ileride eklenecek
 * (docs/03 "🔮 Olası Ek Ürünler"). Hayat → Aşama 4'te eklendi.
 */
export const products: ProductCatalog = {
  [trafik.slug]: trafik,
  [saglik.slug]: saglik,
  [bireyselEmeklilik.slug]: bireyselEmeklilik,
  [hayat.slug]: hayat,
  [konut.slug]: konut,
};

/** Slug'a göre ürün getirir (yoksa undefined). */
export function getProduct(slug: string): ProductDefinition | undefined {
  return products[slug];
}

/** Tüm ürünlerin dizi hâli (listeleme/sitemap için). */
export function getAllProducts(): ProductDefinition[] {
  return Object.values(products);
}

/** Tüm ürün slug'ları (KANONİK = TR; generateStaticParams TR için). */
export function getAllProductSlugs(): string[] {
  return Object.keys(products);
}

// ─────────────────────────────────────────────────────────────────────────────
// Yerelleştirilmiş slug yardımcıları (i18n). docs/03 slug eşleme tablosu.
// TR kanoniktir; EN sayfalar EN slug ile yayınlanır.
// ─────────────────────────────────────────────────────────────────────────────

/** Bir ürünün verilen locale'deki slug'ını döndürür (ör. trafik → traffic). */
export function getLocalizedSlug(product: ProductDefinition, locale: ProductLocale): string {
  return product.slugs[locale];
}

/**
 * Verilen locale + YEREL slug'tan ürünü bulur (ör. en/traffic → trafik ürünü).
 * Bulunamazsa undefined. Rota çözümünde kullanılır.
 */
export function getProductByLocalizedSlug(
  locale: ProductLocale,
  slug: string,
): ProductDefinition | undefined {
  return getAllProducts().find((p) => p.slugs[locale] === slug);
}

/** Bir locale için TÜM yerel ürün slug'ları (generateStaticParams için). */
export function getLocalizedProductSlugs(locale: ProductLocale): string[] {
  return getAllProducts().map((p) => p.slugs[locale]);
}
