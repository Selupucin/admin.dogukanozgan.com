# 01 — Teknoloji & Mimari

## Teknoloji Yığını

| Katman               | Teknoloji                   | Neden                                                               |
| -------------------- | --------------------------- | ------------------------------------------------------------------- |
| **Framework**        | Next.js (App Router)        | Güncel, hızlı; frontend + API + admin tek projede, mükemmel SEO     |
| **Dil**              | TypeScript                  | Tip güvenliği; form alanları/ürün tanımlarını hatasız yönetmek için |
| **Tasarım**          | Tailwind CSS                | Hızlı, tutarlı, mobil öncelikli stil                                |
| **UI bileşenleri**   | shadcn/ui                   | Hazır, erişilebilir bileşenler (özellikle admin panel)              |
| **Form & doğrulama** | React Hook Form + Zod       | Ürün bazında farklı formları temiz ve doğrulanabilir yönetir        |
| **ORM**              | Prisma (`mongodb` provider) | Tip güvenli veritabanı erişimi; şema tek yerden yönetilir           |
| **Veritabanı**       | MongoDB (Atlas)             | Belge tabanlı; `payload` JSON yaklaşımıyla doğal uyum (K25)         |
| **Dosya depolama**   | Vercel Blob                 | Fotoğraf/dosya saklama (tahmin-edilemez token URL) (K25)            |
| **Kimlik doğrulama** | Auth.js (NextAuth)          | Admin girişi (tek/az kullanıcı)                                     |
| **Çok dilli**        | next-intl                   | TR/EN içerik ve rota yönetimi                                       |
| **Tema**             | next-themes                 | Dark/Light mode geçişi                                              |
| **Barındırma**       | Vercel                      | Next.js'in native platformu, otomatik deploy                        |

## Genel Mimari

> ⚠️ **Önemli karar (K21):** Web sitesi ve admin paneli **AYRI domainlerde** çalışır.
> İki ayrı Next.js uygulaması, **aynı MongoDB veritabanını ve Vercel Blob depolamayı**
> paylaşır (K25).

```
   ZİYARETÇİ                                  ADMİN (Doğukan)
   dogukanozgan.com                           admin.dogukanozgan.com
        │                                          │  (ayrı domain)
        ▼                                          ▼
┌────────────────────────┐              ┌────────────────────────┐
│  WEB APP (Next.js)      │              │  ADMIN APP (Next.js)    │
│  • Genel sayfalar       │              │  • Giriş (Auth.js)      │
│  • Ürün + teklif formu  │              │  • Teklif listesi/detay │
│  • Hesaplayıcılar       │              │  • CRM (durum/not)      │
│  • i18n (TR/EN)         │              │  • noindex (gizli)      │
└───────────┬─────────────┘              └───────────┬────────────┘
            │ yazar (Server Action)                  │ okur/günceller
            │ + Blob'a foto yükler                   │ (Prisma)
            └──────────────────┬──────────────────────┘
                               ▼
            ┌──────────────────────────────────────┐
            │   MongoDB Atlas (ortak veritabanı)    │
            │   teklifler, CRM, kullanıcı           │
            └──────────────────────────────────────┘
                               ▲
            ┌──────────────────────────────────────┐
            │   Vercel Blob (ortak dosya deposu)    │
            │   ruhsat/araç fotoğrafları            │
            └──────────────────────────────────────┘
```

**Neden ayrı domain?**

- 🔒 **Güvenlik:** Admin paneli genel siteden tamamen izole; saldırı yüzeyi ayrı.
- 🔍 **SEO temizliği:** Admin domaini tamamen `noindex`; genel site SEO'su etkilenmez.
- 🚀 **Bağımsız dağıtım:** İki uygulama ayrı deploy edilir, biri diğerini etkilemez.
- 🍪 **Çerez/oturum ayrımı:** Admin oturum çerezleri ziyaretçi tarafına hiç değmez.

## Veri Akışı: Teklif Talebi

1. Ziyaretçi bir ürün sayfasındaki **ürüne özel formu** doldurur.
2. **Zod** ile istemci + sunucu tarafında doğrulama yapılır.
3. **KVKK açık rıza** kutusu işaretlenmeden gönderim engellenir.
4. **Server Action**, Prisma ile veritabanına `QuoteRequest` olarak yazar
   (ürün tipi + dinamik alanlar JSON olarak; bkz. [04](./04-veri-modeli.md)).
5. Ziyaretçiye "Talebiniz alındı" onayı gösterilir.
6. Doğukan admin panele girer → talebi görür → CRM durumunu günceller.

## Klasör Yapısı (Monorepo — İki Uygulama)

Ayrı domain kararı (K21) gereği **monorepo** yapısı önerilir: iki Next.js uygulaması,
ortak paketleri (veri modeli, ürün tanımları, UI) paylaşır. (Alternatif: iki ayrı repo —
ama ortak kod tekrarına yol açar.) Her iki uygulama da aynı **MongoDB Atlas** veritabanına
ve aynı **Vercel Blob** deposuna bağlanır (K25).

```
dogukanozgan/                      # monorepo kök (pnpm/turborepo)
├─ apps/
│  ├─ web/                         # → dogukanozgan.com (genel site)
│  │  └─ src/app/[locale]/
│  │     ├─ page.tsx               # Anasayfa
│  │     ├─ hakkimda/  iletisim/  sss/  kvkk/
│  │     └─ planlar/[slug]/        # Ürün detay + teklif formu (+ hesaplayıcı)
│  │
│  └─ admin/                       # → admin.dogukanozgan.com (yönetim)
│     └─ src/app/
│        ├─ login/
│        └─ teklifler/[id]/        # Liste + detay (CRM)  — tümü noindex
│
├─ packages/
│  ├─ db/                          # Prisma şeması + client (ORTAK)
│  │  └─ schema.prisma
│  ├─ products/                    # Ürün tanımları (TEK KAYNAK — A yaklaşımı)
│  │  ├─ definitions.ts            # Tüm ürünler + form alanları burada
│  │  └─ calculators/              # BES, Sağlık, Hayat hesaplama mantığı
│  ├─ ui/                          # Paylaşılan bileşenler + tasarım token'ları
│  └─ config/                      # tsconfig, tailwind, eslint paylaşımı
│
├─ docs/                           # ← Bu dökümantasyon
├─ .env / .env.local               # Gizli anahtarlar (her app kendi env'i)
└─ package.json
```

- **`packages/db`** ve **`packages/products`** her iki uygulamada da kullanılır →
  veri modeli ve ürün tanımları tek yerden yönetilir.
- Her uygulama Vercel'de **ayrı proje** olarak deploy edilir, kendi domaini bağlanır.

## "A Yaklaşımı" Nasıl Çalışır? (Esneklik)

Tüm ürünler **tek bir tanım dosyasında** (`src/features/products/definitions.ts`)
yaşar. Yeni ürün eklemek = bu dosyaya bir nesne eklemek:

```ts
// Örnek (taslak — kesin şema 03'te)
export const products = {
  trafik: {
    slug: "trafik",
    name: { tr: "Trafik Sigortası", en: "Traffic Insurance" },
    hasCalculator: false,
    fields: [
      { name: "adSoyad", type: "text", required: true, label: { tr: "Ad Soyad", en: "Full Name" } },
      { name: "telefon", type: "tel", required: true, label: { tr: "Telefon", en: "Phone" } },
      {
        name: "tcKimlik",
        type: "text",
        required: true,
        label: { tr: "TC Kimlik No", en: "ID No" },
      },
      { name: "plaka", type: "text", required: true, label: { tr: "Plaka", en: "Plate" } },
      // ...
    ],
  },
  // bes: { ... hasCalculator: true, calculator: "bes" }
};
```

Bu sayede:

- Ürün sayfası, form ve doğrulama **otomatik** bu tanımdan üretilir.
- Form alanı eklemek/çıkarmak = tek satır değişiklik.
- Hesaplayıcı gerektiren ürünler `hasCalculator` ile işaretlenir.

> Bu, "form alanlarını ve hesaplayıcıları sonra kolayca düzelteceğim" isteğini
> doğrudan karşılar.

## Geliştirme Araçları & Kod Kalitesi

> ⚠️ **Karar (K24):** Kod kalitesi git hook'larıyla **commit anında** zorunlu kılınır.
> Kapsam **proje içi** (monorepo köküne kurulu Husky); sistem geneli değil. Tüm hook'lar
> `.husky/` altında **commit edilir**, ekip ve CI ile birlikte taşınır.

| Araç            | Rol                                                               |
| --------------- | ----------------------------------------------------------------- |
| **TypeScript**  | Tip güvenliği — `tsc --noEmit` ile derlemesiz kontrol             |
| **ESLint**      | Statik analiz; Next.js + TypeScript eklentileri                   |
| **Prettier**    | Kod biçimlendirme; tek standart                                   |
| **Husky**       | Git hook yöneticisi (`.husky/` versiyonlu)                        |
| **lint-staged** | Sadece **staged** dosyalarda ESLint + Prettier çalıştırır (hızlı) |

**Hook stratejisi:**

- **`pre-commit`** → `pnpm lint-staged` (staged JS/TS/JSON/MD dosyalarına ESLint `--fix`
  - Prettier). Format ve düzeltilebilir lint hataları otomatik çözülür; çözülemeyen
    hata varsa commit engellenir.
- **`pre-push`** → `pnpm typecheck` (kök script, `tsc --noEmit -p .` tüm workspace).
  Tip hatalı kod uzak depoya gitmez.
- **`commit-msg`** → şimdilik **kapalı**. (Conventional Commits/commitlint istenirse
  ileride eklenir; karar gerektiğinde K26 olarak işlenir. K25 MongoDB/Blob geçişine
  ayrıldı — bkz. docs/00.)

**Konfigürasyon yeri:** `packages/config/` (paylaşımlı `eslint`, `prettier`,
`tsconfig` tabanları — apps/web ve apps/admin buradan extend eder).

**Kurulum zamanı:** Hook'lar Aşama 0 setup-engineer adımının parçasıdır (Husky,
lint-staged, ESLint, Prettier, kök `package.json` scriptleri birlikte gelir) —
bkz. [08 Yol Haritası](./08-yol-haritasi.md#aşama-0--hazırlık--kurulum).

**Kapsam dışı:** `C:/Program Files/Git/hooks` (Git kurulum dizini) — sistem geneli
hook'lar bu projede kullanılmaz; tüm hook'lar repo içindedir.

## Ortam Değişkenleri (.env)

```
DATABASE_URL=               # MongoDB Atlas bağlantısı (mongodb+srv://...)
BLOB_READ_WRITE_TOKEN=      # Vercel Blob okuma/yazma token'ı (sunucu tarafı)
AUTH_SECRET=                # Auth.js oturum şifreleme
ADMIN_EMAIL=                # İlk admin kullanıcı
```

> Not (K25): MongoDB `mongodb+srv` bağlantısı tek URL'dir; Prisma `mongodb` provider'ı
> `directUrl` kullanmaz (PostgreSQL'e özgüydü). Şema değişiklikleri `prisma db push`
> ile uygulanır (`migrate` yerine — MongoDB'de SQL migration dosyaları yoktur).
