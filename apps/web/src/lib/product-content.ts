// Ürün TANIM/REKLAM sayfası içerikleri (docs/02 "Ürün tanım/reklam", docs/03).
// Tanım sayfası ürünü TANITIR: ne işe yarar, kapsam/teminat öne çıkanları, avantajlar,
// kısa ürün SSS'i. Bu içerik formdan ayrıdır (form = definitions.ts alanları).
//
// ⚠️ YER TUTUCU İÇERİK: Aşağıdaki metinler docs/03 taslak ürün tanımlarına göre makul
// şekilde yazılmış PLACEHOLDER'lardır. Doğukan'ın gerçek ürün/kapsam metinleri gelince
// güncellenecek (tek dosyadan). TODO(doc): docs/03 "🔧 netleşecekler" — gerçek teminat
// listeleri, avantajlar ve ürün SSS içerikleri.

import type { Locale } from "@/i18n/routing";

type L = Record<Locale, string>;

export interface ProductContent {
  /** Sayfa üstü kısa tanıtım (description'a ek, "ne işe yarar"). */
  intro: L;
  /** "Neyi kapsar / teminat öne çıkanları" maddeleri. */
  coverage: L[];
  /** "Avantajlar / neden bu ürün" maddeleri (başlık + metin). */
  advantages: { title: L; body: L }[];
  /** Ürüne özel kısa SSS (FAQ JSON-LD'ye de beslenir — docs/07). */
  faq: { q: L; a: L }[];
}

// Tüm ürünlerde paylaşılan "neden Doğukan ile" mesajı tanım sayfasında zaten ayrı
// bir bölümle (about değerleriyle paralel) gösterilir; burada ürüne özel içerik var.

const trafik: ProductContent = {
  intro: {
    tr: "Trafik sigortası (zorunlu mali sorumluluk), bir kazada karşı tarafa verebileceğiniz maddi ve bedeni zararları yasal limitler dahilinde güvence altına alır. Araç sahibi olan herkes için zorunludur.",
    en: "Traffic insurance (compulsory motor third-party liability) covers, within legal limits, the material and bodily damage you may cause to others in an accident. It is mandatory for every vehicle owner.",
  },
  coverage: [
    {
      tr: "Karşı araç ve mülke verilen maddi zararlar",
      en: "Material damage to the other vehicle and property",
    },
    {
      tr: "Üçüncü kişilerin bedeni zararları (yaralanma/sağlık giderleri)",
      en: "Bodily injury to third parties (injury / medical costs)",
    },
    {
      tr: "Yasal teminat limitleri kapsamında tazminat",
      en: "Compensation within statutory coverage limits",
    },
  ],
  advantages: [
    {
      title: { tr: "Zorunlu ve hızlı", en: "Mandatory and fast" },
      body: {
        tr: "Plakanıza göre 20+ şirketin tarifesini karşılaştırıp en uygun primi buluyoruz.",
        en: "We compare 20+ companies' tariffs for your plate and find the most suitable premium.",
      },
    },
    {
      title: { tr: "Anında poliçe", en: "Instant policy" },
      body: {
        tr: "Onayınızla poliçeniz hızlıca düzenlenir, e-posta ve WhatsApp ile iletilir.",
        en: "With your approval your policy is issued quickly and sent via email and WhatsApp.",
      },
    },
  ],
  faq: [
    {
      q: {
        tr: "Trafik sigortası fiyatını neden hesaplayıcı vermiyor?",
        en: "Why isn't there a price calculator for traffic insurance?",
      },
      a: {
        tr: "Trafik sigortası primi resmî tarifeye, plakaya ve hasarsızlık basamağınıza bağlıdır; gerçekçi rakam için bilgilerinizi bırakın, size net teklifi sunalım.",
        en: "The traffic premium depends on the official tariff, plate and your no-claims tier; for a realistic figure leave your details and we'll provide an exact quote.",
      },
    },
    {
      q: {
        tr: "Ruhsat fotoğrafı yüklemek zorunlu mu?",
        en: "Is uploading the registration photo mandatory?",
      },
      a: {
        tr: "Zorunlu değil ama yüklerseniz teklif süreci hızlanır.",
        en: "It is not mandatory, but uploading it speeds up the quote process.",
      },
    },
  ],
};

const saglik: ProductContent = {
  intro: {
    tr: "Özel ve tamamlayıcı sağlık sigortası, SGK'nın karşılamadığı veya kısmen karşıladığı tedavi giderlerinizi güvence altına alır; özel hastanelere erişiminizi kolaylaştırır.",
    en: "Private and complementary health insurance covers treatment costs that SGK does not or only partly covers, and eases your access to private hospitals.",
  },
  coverage: [
    {
      tr: "Yatarak tedavi (ameliyat, hastane) giderleri",
      en: "Inpatient treatment (surgery, hospital) costs",
    },
    {
      tr: "Ayakta tedavi (muayene, tahlil, görüntüleme)",
      en: "Outpatient treatment (consultation, lab, imaging)",
    },
    {
      tr: "Tamamlayıcı (TSS) ile anlaşmalı kurumlarda düşük katkı payı",
      en: "Low co-payment at contracted institutions with complementary (TSS) plans",
    },
  ],
  advantages: [
    {
      title: { tr: "Size uygun plan", en: "A plan that fits you" },
      body: {
        tr: "Bireysel veya aile kapsamına, bütçenize ve beklentinize göre en doğru planı birlikte seçeriz.",
        en: "We choose the right plan together based on individual or family coverage, your budget and expectations.",
      },
    },
    {
      title: { tr: "Şeffaf teminat", en: "Transparent coverage" },
      body: {
        tr: "Limitleri, bekleme sürelerini ve istisnaları sade bir dille anlatırız.",
        en: "We explain limits, waiting periods and exclusions in plain language.",
      },
    },
  ],
  faq: [
    {
      q: {
        tr: "TSS ile özel sağlık sigortası farkı nedir?",
        en: "What is the difference between TSS and private health insurance?",
      },
      a: {
        tr: "Tamamlayıcı Sağlık Sigortası (TSS) SGK'yı tamamlar ve anlaşmalı kurumlarda düşük maliyet sunar; özel sağlık sigortası daha geniş kapsam ve hastane ağı sağlar.",
        en: "Complementary Health Insurance (TSS) supplements SGK with low cost at contracted institutions; private health insurance offers broader coverage and hospital network.",
      },
    },
    {
      q: { tr: "Sağlık bilgilerim güvende mi?", en: "Is my health data safe?" },
      a: {
        tr: "Evet. Sağlık verisi özel nitelikli kişisel veridir; yalnızca ayrı açık rızanızla, en aza indirilerek ve erişim kısıtlı şekilde işlenir.",
        en: "Yes. Health data is special-category personal data; it is processed only with your separate explicit consent, minimised and with restricted access.",
      },
    },
  ],
};

const bireyselEmeklilik: ProductContent = {
  intro: {
    tr: "Bireysel Emeklilik Sistemi (BES), düzenli birikimlerinize %30 devlet katkısı ekleyerek uzun vadede daha büyük bir emeklilik birikimi oluşturmanızı sağlar.",
    en: "The Private Pension System (BES) adds a 30% state contribution to your regular savings, helping you build a larger retirement fund over the long term.",
  },
  coverage: [
    { tr: "Katkılarınıza %30 devlet katkısı", en: "30% state contribution on your payments" },
    {
      tr: "Çeşitli risk profillerine uygun fon seçenekleri",
      en: "Fund options for various risk profiles",
    },
    { tr: "Esnek ödeme ve ara verme imkânı", en: "Flexible payments and the option to pause" },
  ],
  advantages: [
    {
      title: { tr: "Hesaplayıcı ile öngörü", en: "Foresight with the calculator" },
      body: {
        tr: "Aylık ödeme ve süreye göre tahmini birikiminizi anında görebilirsiniz.",
        en: "See your estimated savings instantly based on monthly payment and term.",
      },
    },
    {
      title: { tr: "Uzun vadeli avantaj", en: "Long-term advantage" },
      body: {
        tr: "Erken başlamak, bileşik getiri sayesinde birikiminizi belirgin şekilde büyütür.",
        en: "Starting early grows your savings notably thanks to compound returns.",
      },
    },
  ],
  faq: [
    {
      q: { tr: "Devlet katkısı oranı nedir?", en: "What is the state contribution rate?" },
      a: {
        tr: "Mevcut düzenlemede katkı paylarınıza %30 devlet katkısı eklenir (güncel mevzuata göre teyit edilir).",
        en: "Under current regulation a 30% state contribution is added to your payments (confirmed per current legislation).",
      },
    },
    {
      q: { tr: "Birikimime ara verebilir miyim?", en: "Can I pause my contributions?" },
      a: {
        tr: "Evet, sistem esnektir; ödemelere ara verebilir, tutarınızı güncelleyebilirsiniz.",
        en: "Yes, the system is flexible; you can pause payments and update your amount.",
      },
    },
  ],
};

const hayat: ProductContent = {
  intro: {
    tr: "Hayat sigortası, beklenmedik bir durumda sevdiklerinizin maddi geleceğini güvence altına alır; kredi teminatından birikime kadar farklı amaçlara uyarlanabilir.",
    en: "Life insurance secures the financial future of your loved ones in an unexpected event; it can be tailored from loan protection to savings.",
  },
  coverage: [
    {
      tr: "Vefat durumunda belirlenen teminatın ödenmesi",
      en: "Payment of the agreed coverage in case of death",
    },
    { tr: "Kredi bağlantılı teminat seçenekleri", en: "Loan-linked coverage options" },
    {
      tr: "İsteğe bağlı ek teminatlar (kaza, maluliyet vb.)",
      en: "Optional riders (accident, disability, etc.)",
    },
  ],
  advantages: [
    {
      title: { tr: "Amaca göre kurgu", en: "Designed by purpose" },
      body: {
        tr: "Kredi, koruma veya birikim hedefinize göre teminat ve süreyi birlikte belirleriz.",
        en: "We set coverage and term together based on your loan, protection or savings goal.",
      },
    },
    {
      title: { tr: "Tahmini prim", en: "Estimated premium" },
      body: {
        tr: "Hesaplayıcı ile yaş, teminat ve süreye göre yaklaşık primi önceden görün.",
        en: "See an approximate premium upfront by age, coverage and term with the calculator.",
      },
    },
  ],
  faq: [
    {
      q: { tr: "Sağlık beyanı gerekir mi?", en: "Is a health declaration required?" },
      a: {
        tr: "Bazı durumlarda sigara/sağlık beyanı istenir; bu bilgiler özel nitelikli sayılır ve ayrı açık rıza ile işlenir.",
        en: "In some cases a smoking/health declaration is requested; this is special-category data processed with separate explicit consent.",
      },
    },
    {
      q: {
        tr: "Kredi için hayat sigortası şart mı?",
        en: "Is life insurance required for a loan?",
      },
      a: {
        tr: "Bazı kredilerde teminat olarak istenebilir; size en uygun kredi bağlantılı poliçeyi karşılaştırırız.",
        en: "Some loans may require it as security; we compare the most suitable loan-linked policy for you.",
      },
    },
  ],
};

const konut: ProductContent = {
  intro: {
    tr: "Konut sigortası, evinizi ve eşyalarınızı yangın, hırsızlık, su baskını gibi risklere karşı korur; DASK'a ek olarak kapsamlı güvence sağlar.",
    en: "Home insurance protects your home and belongings against risks such as fire, theft and flooding, providing comprehensive cover in addition to DASK.",
  },
  coverage: [
    { tr: "Yangın, infilak, duman zararları", en: "Fire, explosion and smoke damage" },
    { tr: "Hırsızlık ve su baskını (dahili su)", en: "Theft and water damage (internal water)" },
    { tr: "Eşya ve isteğe bağlı ek teminatlar", en: "Contents and optional additional covers" },
  ],
  advantages: [
    {
      title: { tr: "İhtiyaca özel kapsam", en: "Coverage tailored to needs" },
      body: {
        tr: "Brüt m², yapı tarzı ve eşya bedelinize göre dengeli bir teminat kurgularız.",
        en: "We design balanced coverage based on your gross m², construction type and contents value.",
      },
    },
    {
      title: { tr: "Ev sahibi/kiracı ayrımı", en: "Owner / tenant distinction" },
      body: {
        tr: "Mülk tipinize uygun en doğru poliçeyi öneririz.",
        en: "We recommend the most suitable policy for your property type.",
      },
    },
  ],
  faq: [
    {
      q: {
        tr: "Konut sigortası DASK'ın yerine geçer mi?",
        en: "Does home insurance replace DASK?",
      },
      a: {
        tr: "Hayır. DASK zorunlu deprem sigortasıdır; konut sigortası bunu tamamlayan geniş kapsamlı bir poliçedir.",
        en: "No. DASK is mandatory earthquake insurance; home insurance is a broader policy that complements it.",
      },
    },
    {
      q: {
        tr: "Kiracı olarak konut sigortası yaptırabilir miyim?",
        en: "Can I get home insurance as a tenant?",
      },
      a: {
        tr: "Evet, eşyalarınızı kapsayan kiracı dostu poliçeler mevcuttur.",
        en: "Yes, tenant-friendly policies covering your contents are available.",
      },
    },
  ],
};

/** Slug (kanonik = TR) -> tanım sayfası içeriği. Bilinmeyen ürün için undefined. */
const byCanonicalSlug: Record<string, ProductContent> = {
  trafik,
  saglik,
  "bireysel-emeklilik": bireyselEmeklilik,
  hayat,
  konut,
};

export function getProductContent(canonicalSlug: string): ProductContent | undefined {
  return byCanonicalSlug[canonicalSlug];
}
