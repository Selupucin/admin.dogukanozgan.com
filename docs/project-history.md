# Project History — Geliştirme Günlüğü

> **Append-only.** Her geliştirme/değişiklikten sonra **en sona** yeni kayıt eklenir.
> Eski kayıtlar **silinmez/değiştirilmez**. (Kural: bkz. [CLAUDE.md](../CLAUDE.md))

## Kayıt Şablonu

Her kayıt aşağıdaki formatta olmalı:

```
### [YYYY-AA-GG] — <Kısa başlık>
- **Agent:** <agent adı veya "main">
- **Ne:** <yapılan iş — kısa ve net>
- **Neden:** <gerekçe / hangi ihtiyaç>
- **Dosyalar:** <eklenen/değişen dosyalar>
- **İlgili döküman/karar:** <örn. docs/04, K11, Aşama 2>
- **Notlar / yer tutucular:** <varsa TODO(doc), açık konular>
```

---

## Kayıtlar

### [2026-06-04] — Dökümantasyon seti ve agent altyapısı oluşturuldu

- **Agent:** main
- **Ne:** `docs/` altına 00–09 + README proje dökümantasyonu yazıldı; `CLAUDE.md`
  proje kuralları, `.claude/agents/` altında geliştirme sub-agent'ları ve bu
  project-history dosyası oluşturuldu.
- **Neden:** Projeyi koda başlamadan önce planlamak ve geliştirmeyi dökümana bağlı,
  izlenebilir kılmak.
- **Dosyalar:** `docs/*.md`, `CLAUDE.md`, `.claude/agents/*.md`, `docs/project-history.md`
- **İlgili döküman/karar:** Tümü (K1–K23)
- **Notlar / yer tutucular:** Henüz uygulama kodu yok. Sıradaki: Aşama 0 (kurulum).
  KVKK saklama süresi/yasal metinler açık (hukukçu onayı bekliyor).

### [2026-06-04] — Kural zorlama hook'ları kuruldu

- **Agent:** main
- **Ne:** İki geliştirme kuralı hook ile zorunlu kılındı. (B) Stop hook
  `.claude/hooks/check-project-history.ps1` — apps/ veya packages/ altında
  project-history.md'den yeni dosya varsa turu engelleyip kayıt eklenmesini ister.
  (A) SessionStart hook — her oturum başında docs/ bağlılık + history kuralını bağlama
  enjekte eder. Script üç senaryoda test edildi (klasör yok / stop_hook_active / block).
- **Neden:** Kuralların sadece talimat değil, harness tarafından uygulanması (kullanıcı isteği).
- **Dosyalar:** `.claude/settings.json`, `.claude/hooks/check-project-history.ps1`
- **İlgili döküman/karar:** CLAUDE.md Kural 1 & 2
- **Notlar / yer tutucular:** ⚠️ settings.json oturum ortasında oluşturuldu; hook'lar
  aktif olması için kullanıcının bir kez `/hooks` açması veya Claude Code'u yeniden
  başlatması gerekebilir (settings watcher caveat).

### [2026-06-04] — Git repo başlatıldı, .gitignore + hook kararı (K24) docs'a işlendi

- **Agent:** main
- **Ne:** (1) Proje kökünde `git init -b main` ile repo başlatıldı. (2) Kapsamlı kök
  `.gitignore` yazıldı (Node, Next.js, Turborepo, Prisma, Supabase, TypeScript,
  Husky `_/`, editor/OS artefaktları, **tüm `.env*` hariç `*.example`**). (3) Git
  hook stratejisi **K24** olarak `docs/01-teknoloji-mimari.md`'ye "Geliştirme
  Araçları & Kod Kalitesi" bölümü altında işlendi: Husky + lint-staged, `pre-commit`
  (lint-staged → ESLint + Prettier) + `pre-push` (`tsc --noEmit`), `commit-msg`
  şimdilik kapalı. Paylaşımlı config `packages/config/` altında. (4) `docs/08`
  Aşama 0 listesine "Kod kalitesi araçları", "Git hook'ları" ve tamamlanmış
  "Git repo + .gitignore" maddeleri eklendi.
- **Neden:** Kullanıcı proje hook'u kurma talebi (bkz. "C:/Program Files/Git/hooks"
  — yanlış konum olduğu açıklandı, proje içine yönlendirildi). Kararın **kod öncesi
  docs'ta** olması CLAUDE.md Kural 1'in gereği. Hook çalıştırması için ESLint/
  Prettier/tsconfig/package.json gerektiğinden **kurulum Aşama 0 setup-engineer'a**
  bırakıldı; karar şimdi sabitlendi.
- **Dosyalar:** `.gitignore` (yeni), `.git/` (init), `docs/01-teknoloji-mimari.md`
  (Geliştirme Araçları bölümü + K24), `docs/08-yol-haritasi.md` (Aşama 0 maddeleri),
  `docs/project-history.md` (bu kayıt)
- **İlgili döküman/karar:** K24 (yeni), CLAUDE.md Kural 1, Aşama 0
- **Notlar / yer tutucular:** Husky/lint-staged/ESLint/Prettier paket kurulumu ve
  `.husky/pre-commit` + `.husky/pre-push` script dosyalarının yazımı **Aşama 0'da**
  (setup-engineer) yapılacak. `commit-msg` (commitlint) açılırsa K25 olarak işlenmeli.

### [2026-06-04] — Aşama 0: Monorepo iskeleti kuruldu (apps + packages, çalışır)

- **Agent:** setup-engineer
- **Ne:** docs/08 Aşama 0 checklist'i uygulandı. pnpm workspaces + Turborepo
  monorepo kuruldu. Paket scope: `@do/*`.
  - **apps/web** (`@do/web`, dogukanozgan.com, port 3000): Next.js 15 App Router +
    TS + Tailwind v3 + shadcn temel (components.json). next-intl (TR/EN, `/[locale]`
    rota, middleware, messages tr/en) + next-themes (dark, system). Fraunces +
    Hanken Grotesk next/font ile (`latin-ext` TR alt kümesi). Anasayfa iskeleti.
  - **apps/admin** (`@do/admin`, admin.dogukanozgan.com, port 3001): aynı yığın;
    locale-prefixed rota YOK (docs/01) — sabit TR. `/login`, `/teklifler` iskeletleri.
    Tüm domain `noindex` (layout metadata robots + `robots.ts` disallow).
  - **packages/db** (`@do/db`): Prisma 6 kurulumu + `schema.prisma` (QuoteRequest,
    Note, User, Asset + QuoteStatus/Role enum) docs/04'e birebir. KVKK rıza alanları
    dahil. Singleton client `src/index.ts`. `prisma generate` ✅ çalıştı (migration
    YOK — DB bağlantısı yok). `.env.example` (DATABASE_URL, DIRECT_URL placeholder).
  - **packages/products** (`@do/products`): boş `definitions.ts` (boş katalog +
    getProduct/getAllProducts), `types.ts` (FieldType docs/03 sözlüğü ile birebir;
    LocalizedText, ProductDefinition, CalculatorKind = bes|saglik|hayat),
    `calculators/` yer tutucu.
  - **packages/ui** (`@do/ui`): docs/09 renk paleti (lacivert #10243a / teal #1c6e6a /
    turuncu CTA #f25a32 / krem) HSL CSS değişkenleri olarak `globals.css` (light +
    dark varyant); Tailwind preset (renkler, pill radius, font-heading/body); shadcn
    `cn` util; `prefers-reduced-motion` desteği.
  - **packages/config** (`@do/config`): paylaşımlı ESLint 9 flat config (base + next),
    Prettier config, tsconfig base + next (K24). Kök `prettier.config.js` bunu
    re-export eder.
  - **Husky + lint-staged** (K24): `.husky/pre-commit` → `pnpm lint-staged`,
    `.husky/pre-push` → `pnpm typecheck`. `prepare: husky` ile kuruldu
    (core.hooksPath = .husky/_, repoda versiyonlu; `_/` gitignore'da).
  - **Vercel/deploy:** iki ayrı proje yapısı her app'te `vercel.json` + kök `README.md`
    "Dağıtım" tablosu (root dir, install/build komutları, domain bağlama, env listesi).
- **Neden:** docs/08 Aşama 0 — "iki domainde çalışan, deploy edilebilir iskelet".
- **Dosyalar:** `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `.npmrc`,
  `prettier.config.js`, `.prettierignore`, `README.md`, `.husky/{pre-commit,pre-push}`,
  `apps/web/**`, `apps/admin/**`, `packages/{db,products,ui,config}/**`,
  `docs/project-history.md` (bu kayıt).
- **İlgili döküman/karar:** Aşama 0, K2/K8/K9/K10/K11/K21/K24, docs/01, docs/04,
  docs/07, docs/09.
- **Doğrulama:** `pnpm install` ✅, `pnpm db:generate` ✅, `pnpm typecheck` 5/5 ✅,
  `pnpm build` 2/2 ✅ (web `/tr`+`/en` SSG; admin `/`,`/login`,`/teklifler`,`/robots.txt`),
  `pnpm lint` 2/2 ✅ (No ESLint warnings or errors).
- **Notlar / yer tutucular:**
  - `// TODO(doc)` yer tutucular: `products/definitions.ts` (ürünler Aşama 1),
    `products/types.ts` (alan tipleri), `calculators/` (formüller Aşama 4),
    web anasayfa "Teklif Al" butonu, layout SEO metadata (Aşama 5), font TR karakter
    teyidi (docs/09), admin Auth.js/middleware (Aşama 3).
  - **Varsayım:** Paket scope `@do/*` seçildi (docs'ta scope belirtilmemişti — makul
    kısaltma). Tailwind **v3** seçildi (shadcn/ui ile en stabil; docs sürüm belirtmiyor).
    Admin'de locale-prefixed rota kullanılmadı (docs/01 admin route yapısı düz `/login`,
    `/teklifler` gösteriyor); next-intl yalnızca string yönetimi için sabit TR ile.
  - **Engel/açık:** Gerçek Supabase projesi + anahtarları YOK → DB migration ve
    Storage Aşama 2+'de gerçek `.env` ile. Domain DNS bağlama Aşama 6.
  - **Uyarı:** `next lint` Next 16'da kaldırılacak (deprecation notice); ileride ESLint
    CLI'ye geçiş gerekebilir — şimdilik çalışıyor.
- **Sonraki:** Aşama 1 (ürün altyapısı — definitions.ts doldurma, otomatik form).

<!-- Yeni kayıtları BURANIN ALTINA ekle -->

### [2026-06-04] — Aşama 1: Ürün altyapısı (A yaklaşımı) — tanımlar, otomatik form, ürün sayfaları

- **Agent:** web-builder
- **Ne:** docs/08 Aşama 1 checklist'i uygulandı.
  - **`packages/products/types.ts` genişletildi:** `ProductField`'a `placeholder`,
    `validation` (min/max/minLength/maxLength/pattern/accept/maxSizeMb), `sensitive`
    (KVKK 2. rıza tetikleyici) eklendi; `FieldOption` ayrıştırıldı; `ProductDefinition`'a
    `icon` (lucide anahtarı) eklendi. FieldType docs/03 sözlüğüyle birebir korundu.
  - **`packages/products/definitions.ts` dolduruldu:** docs/03 taslak tablolarına göre
    4 ürün — **trafik** (hesaplayıcı yok, fotoğraf `file` alanı + tcKimlik/plaka),
    **saglik** (`sensitive: true`, kronikHastalik alanı `sensitive`, calculator: saglik),
    **bireysel-emeklilik** (calculator: bes), **konut** (hesaplayıcı yok). Ortak alanlar
    (adSoyad/telefon/eposta/il) tek yerden. `getAllProductSlugs()` eklendi.
  - **Otomatik form (`apps/web/src/components/auto-form/`):**
    - `schema.ts` — `buildFormSchema(fields, locale, sensitive)` alan tanımlarından
      **Zod şeması TÜRETİR** (TR/EN hata mesajları). tcKimlik (11 hane), plaka (regex),
      tel (>=10 rakam), email, number (coerce+min/max), select/radio (enum), file
      (boyut/accept, opsiyonel). KVKK `kvkkConsent` (zorunlu true) + sensitive ise
      `sensitiveConsent` şemaya otomatik eklenir.
    - `field.tsx` — alan tipine göre render (docs/09: yuvarlak girdi, teal focus ring,
      radio pill, checkbox, file). `aria-describedby`, `role="alert"` ile erişilebilir.
    - `auto-form.tsx` — RHF + zodResolver; KVKK rıza kutuları; başarı/sıfırlama ekranı;
      gönderim **placeholder** (Aşama 2 bağlantı noktası işaretli).
  - **Sayfalar:** `/[locale]/planlar` (kart listesi, ikon+hesaplayıcı rozeti) ve
    `/[locale]/planlar/[slug]` (generateStaticParams locale x slug; ürüne özel
    title/meta + canonical/hreflang + Service JSON-LD; hesaplayıcı yer tutucu + form).
    `calculator-placeholder.tsx` — "Tahmini değerdir" uyarısı (docs/03 zorunlu).
  - **i18n:** tr.json/en.json'a `plans`, `form`, `calculator` namespace'leri.
- **Neden:** docs/08 Aşama 1 — "ürün sayfaları ve formları (henüz DB'ye yazmadan) görünür".
- **Dosyalar:** `packages/products/src/{types,definitions}.ts`,
  `apps/web/src/components/auto-form/{schema,field,auto-form,types-bridge,index}.{ts,tsx}`,
  `apps/web/src/components/product-icon.tsx`,
  `apps/web/src/app/[locale]/planlar/page.tsx`,
  `apps/web/src/app/[locale]/planlar/[slug]/{page,calculator-placeholder}.tsx`,
  `apps/web/src/messages/{tr,en}.json`, `apps/web/package.json` (yeni bağımlılıklar),
  `docs/project-history.md` (bu kayıt).
- **İlgili döküman/karar:** Aşama 1, docs/01 (RHF+Zod, A yaklaşımı), docs/02 (rotalar),
  docs/03 (alan tipleri/ürünler/hesaplayıcı), docs/07 (SEO/hreflang/JSON-LD), docs/09 (stil).
- **Doğrulama:** Yeni bağımlılıklar `react-hook-form`, `zod@4.4.3`,
  `@hookform/resolvers`, `lucide-react` eklendi. `pnpm typecheck` 5/5 OK,
  `pnpm --filter @do/web build` OK (15 statik sayfa: planlar + 4 ürün x TR/EN; uyarı yok).
- **Notlar / yer tutucular / varsayımlar:**
  - **TASLAK:** Tüm form alanları docs/03 taslak tablolarından; nihai alanlar Doğukan'dan
    gelince `definitions.ts` güncellenecek (`// TODO(doc)` işaretli).
  - **Yer tutucular:** Hesaplayıcılar görsel placeholder (gerçek formül Aşama 4,
    `calculators/`); form gönderimi `auto-form.tsx onSubmit` içinde Aşama 2 bağlantı
    noktası; trafik dosya alanı yalnızca seç/validasyon — **upload Aşama 2** (Storage);
    KVKK linki `/kvkk`'ye Aşama 2'de bağlanacak; il listesi kısa (4) — tam liste TODO.
  - **Varsayım:** İkon sistemi lucide-react ile (docs "ince çizgi SVG ikon" — makul);
    `icon` alanı tip sistemine eklendi (docs örneğinde yok ama A yaklaşımı tek-kaynak
    ruhuna uygun). Plaka/tel/tcKimlik regex'leri esnek tutuldu (kesin desen `// TODO(doc)`).
    Zod **v4** kuruldu (en güncel; `invalid_type_error` → `error` API'sine uyarlandı).
  - **Engel/açık:** docs/03 "netleşecekler" — e-posta zorunlu mu, trafik foto zorunlu mu,
    konut hesaplayıcısı olacak mı → mevcut taslak varsayımlarla bırakıldı.
- **Aşama 2 için hazır:** `AutoForm.onSubmit` (auto-form.tsx) tek gönderim noktası —
  buraya backend-engineer'ın Server Action'ı (`{ slug, payload: values }` + dosya
  yükleme + KVKK rıza kanıtı) bağlanacak. `buildFormSchema` sunucu doğrulamasında
  yeniden kullanılabilir.

### [2026-06-04] — Aşama 2: Teklif akışı + dosya yükleme + KVKK (Server Action, Storage, yasal sayfalar)

- **Agent:** backend-engineer
- **Ne:** docs/08 Aşama 2 uygulandı.
  - **Server Action (`apps/web/src/lib/submit-quote.ts`):** `submitQuoteRequest(FormData)`
    → (1) IP başına rate limit, (2) honeypot spam kontrolü, (3) **`buildFormSchema` ile
    SUNUCUDA yeniden doğrulama** (istemci ile aynı şema), (4) KVKK rıza kontrolü:
    `kvkkConsent` zorunlu; ürün/alan `sensitive` ise `sensitiveConsent` da zorunlu
    (sunucuda da reddedilir), (5) `QuoteRequest` oluşturma — **ortak alanlar (adSoyad/
    telefon/eposta) sütun, ürüne özel alanlar `payload` JSON** (docs/04 yaklaşım B),
    rıza kanıtı `consentKvkk/Sensitive/At/Ip/UserAgent` kaydı (docs/06 §2), (6) dosya
    yükleme → private bucket + `Asset` kaydı. Hata dönüşleri tiplenmiş
    (`SubmitQuoteResult.error`), alan bazlı hatalar RHF'e yansıtılır.
  - **Supabase Storage (`packages/db/src/storage.ts`):** PRIVATE bucket `quote-assets`.
    `@supabase/supabase-js` bağımlılığı YOK — Storage REST API fetch ile çağrılır
    (service-role anahtarı YALNIZCA sunucuda). `uploadToStorage`, **`createSignedUrl`
    (kısa ömürlü, 60 sn — admin görüntüleme için)**, `deleteFromStorage`. Env yoksa
    `isStorageConfigured()` false → yükleme zarifçe atlanır (feature flag), teklif yine
    kaydedilir. `@do/db`'den export edildi (admin Aşama 3 imzalı URL için kullanır).
  - **KVKK silme/anonimleştirme (`packages/db/src/kvkk.ts`):** `deleteQuoteRequest`
    (kalıcı sil + Storage dosyalarını sil), `anonymizeQuoteRequest` (kişisel veriyi
    maskele/temizle, Asset'leri sil, istatistik kaydını koru), `purgeExpiredQuoteRequests`
    (saklama süresi dolanları toplu işle — `RETENTION_DAYS` şimdilik null = NO-OP).
    Aşama 3 admin paneli bunları çağıracak.
  - **Rate limit (`apps/web/src/lib/rate-limit.ts`):** IP başına in-memory sabit pencere
    (15 dk / 8 gönderim). + honeypot `website` alanı (görünmez) spam koruması.
  - **Çerez banner (`apps/web/src/components/cookie-consent.tsx`):** ilk ziyarette,
    "Tümünü kabul / Yalnızca zorunlu", tercih localStorage'da. Locale layout'a mount edildi.
  - **Yasal sayfalar:** `/[locale]/kvkk` (aydınlatma), `/gizlilik`, `/cerez-politikasi`
    - ortak `LegalPage` kabuğu (üstte TASLAK uyarısı). Metinler docs/06'ya dayalı
      **PLACEHOLDER**.
  - **AutoForm bağlandı (`auto-form.tsx`):** Aşama 1 placeholder onSubmit kaldırıldı;
    RHF değerleri FormData'ya çevrilip Server Action çağrılıyor; başarı/hata ekranları
    gerçek sonuca göre; KVKK linki gerçek `/kvkk` sayfasına (next-intl Link).
- **Neden:** docs/08 Aşama 2 — "teklif formları gerçekten gönderilir, panele düşer; KVKK uyumlu".
- **Dosyalar:** `packages/db/src/{storage,kvkk,index}.ts`, `packages/db/prisma/schema.prisma`
  (yalnızca migration/Aşama 2 notu — şema alanları değişmedi),
  `apps/web/src/lib/{submit-quote,rate-limit}.ts`,
  `apps/web/src/components/{auto-form/auto-form.tsx,cookie-consent.tsx,legal-page.tsx}`,
  `apps/web/src/app/[locale]/{layout.tsx,kvkk,gizlilik,cerez-politikasi}/page.tsx`,
  `apps/web/src/messages/{tr,en}.json`, `apps/web/.env.example`, `docs/project-history.md`.
- **İlgili döküman/karar:** Aşama 2, docs/03 (form→DB eşlemesi), docs/04 (QuoteRequest +
  payload JSON + Asset + private bucket + imzalı URL), docs/06 (KVKK rıza+kanıt, özel
  nitelikli veri 2. rıza, rate limit, çerez banner, yasal sayfalar, silme/anonimleştirme).
- **Doğrulama:** `pnpm typecheck` 5/5 ✅, `pnpm build` 2/2 ✅ (web: 3 yasal sayfa x TR/EN
  SSG dahil 21 sayfa; admin 2/2). Migration ÇALIŞTIRILMADI (gerçek DB yok).
- **ŞEMA DEĞİŞİKLİĞİ:** Yok. Mevcut `QuoteRequest`/`Asset` alanları (docs/04) yeterliydi.
  İlk migration komutu schema.prisma başına not olarak eklendi
  (`pnpm --filter @do/db prisma migrate dev --name init`) + Supabase'de PRIVATE
  bucket "quote-assets" oluşturma notu.
- **Notlar / yer tutucular / varsayımlar:**
  - ⚠️ **HUKUKÇU ONAYI BEKLEYEN YASAL METİNLER:** `/kvkk`, `/gizlilik`,
    `/cerez-politikasi` sayfa içerikleri ve i18n `legal.*` metinleri TASLAK
    placeholder'dır (docs/06 sorumluluk reddi + §8). Sayfalarda görünür "TASLAK"
    uyarısı var. Nihai metin onaylanmadan yayımlanmamalı. `// TODO(doc)` işaretli.
  - **Varsayım (ortak alan eşlemesi):** Server Action ad-soyad alanını
    `field.name === "adSoyad"` (definitions.ts sabiti), telefonu `type === "tel"`,
    e-postayı `type === "email"` ile sütuna eşler; gerisi `payload`. Alan adı değişirse
    `splitCommonFields` güncellenmeli (`// TODO(doc)`).
  - **Varsayım (Storage):** `@supabase/supabase-js` yerine REST API + fetch tercih
    edildi (bağımlılık eklememek + env yoksa feature-flag için). Bucket adı `quote-assets`,
    imzalı URL TTL 60 sn (docs/04 "kısa ömürlü" — kesin değer netleşince ayarlanır).
    `Asset.url` private bucket nedeniyle boş bırakılır; görüntülemede `createSignedUrl`
    ile üretilir.
  - **Varsayım (rate limit):** in-memory tek-process; Vercel'de dağıtık değil → temel
    spam caydırıcılığı. Üretimde Upstash/Redis'e geçilebilir (`// TODO(doc)`). Eşik
    8/15dk makul varsayım.
  - **Varsayım (saklama süresi):** `RETENTION_DAYS = null` → otomatik imha kapalı;
    hukukçu süreyi belirleyince doldurulacak (docs/06 §7).
  - **Engel/açık:** Gerçek Supabase (DB+Storage) anahtarları YOK → çalışma zamanı
    uçtan uca test edilemedi; kod env gelince çalışacak şekilde feature-flag'li.
- **Aşama 3 (admin) için hazır:** `@do/db`'den `createSignedUrl` (Asset görüntüleme),
  `deleteQuoteRequest` / `anonymizeQuoteRequest` / `purgeExpiredQuoteRequests`
  (KVKK silme/imha) util'leri çağrılabilir. `QuoteRequest` kayıtları rıza kanıtı +
  payload + Asset ilişkisiyle panele düşmeye hazır.

### [2026-06-04] — Aşama 3: Admin Panel & CRM (auth, liste, detay, CRM, KVKK)

- **Agent:** admin-builder
- **Ne:** `apps/admin` Aşama 0 iskeletinden tam işlevsel yönetim paneline çıkarıldı:
  - **Auth.js (NextAuth v5)** Credentials girişi (`/login`), bcrypt şifre hash; tüm
    rotalar `middleware` ile korunur (login + `/api/auth/*` hariç). Edge-güvenli
    `auth.config.ts` (prisma/bcrypt YOK) middleware'i, tam `auth.ts` route handler'ı
    ve server action'ları besler (split-config deseni). JWT oturumu → adapter yok.
  - **Teklif listesi** (`/teklifler`): özet kartları (Toplam/Yeni/Bu hafta/Poliçe),
    ürün+durum+tarih filtresi + ad/telefon araması (URL query); sunucu bileşeni + Prisma.
  - **Teklif detayı** (`/teklifler/[id]`): `payload` definitions.ts TR etiketleriyle
    okunabilir (select/radio/date/boolean çözülür), özel nitelikli alan işaretlenir;
    fotoğraflar `createSignedUrl` ile (private bucket); ara/WhatsApp/e-posta hızlı
    aksiyonlar; KVKK rıza kanıtı (consentKvkk/Sensitive/At/Ip/UserAgent) salt-okunur.
  - **CRM**: durum değiştirme (YENI→ARANDI→TEKLIF_VERILDI→POLICE_YAPILDI / IPTAL,
    docs/05 akışı; izinli geçişler `crm.ts`'te) + zaman damgalı not ekleme (Note).
  - **KVKK aksiyonları**: anonimleştir / kalıcı sil (onay diyaloglu, `@do/db` util'leri).
  - Sade UI primitive'leri (`components/ui.tsx`) docs/09 token'larıyla; boş/hata/yükleme
    durumları (DB yoksa zarif uyarı, Storage yoksa imzalı URL atlanır).
- **Neden:** docs/08 Aşama 3 — Doğukan'ın teklifleri görüp CRM ile yönetmesi.
- **Dosyalar:**
  - Şema: `packages/db/prisma/schema.prisma` (User'a `passwordHash String?` eklendi).
  - `@do/db`: `src/auth.ts` (hashPassword/verifyPassword/verifyAdminCredentials),
    `src/index.ts` (auth export), `prisma/seed-admin.ts` (ilk admin), `package.json`
    (bcryptjs + tsx + seed:admin script).
  - admin auth: `src/auth.config.ts`, `src/auth.ts`, `src/middleware.ts`,
    `src/app/api/auth/[...nextauth]/route.ts`, `src/types/next-auth.d.ts`.
  - admin sayfalar/aksiyonlar: `src/app/page.tsx` (→/teklifler), `src/app/actions.ts`
    (signOut), `src/app/login/{page,login-form,actions}.tsx`, `src/app/teklifler/{layout,
page,filters}.tsx`, `src/app/teklifler/[id]/{page,actions,status-control,note-form,
kvkk-actions}.tsx`.
  - admin lib/bileşen: `src/lib/{crm,payload,contact,quotes}.ts`, `src/components/
{ui.tsx,app-header.tsx}`.
  - Diğer: `apps/admin/package.json` (next-auth/bcryptjs/lucide-react), `.env.example`
    (AUTH*SECRET/ADMIN*\* notları), `src/messages/tr.json`, `apps/admin/README.md`.
- **İlgili döküman/karar:** Aşama 3, docs/05 (CRM akışı/ekranlar), docs/01 (ayrı domain,
  noindex, AUTH_SECRET), docs/04 (model/alan adları), docs/06 (rıza kanıtı, sil/anonim,
  erişim güvenliği).
- **ŞEMA DEĞİŞİKLİĞİ:** `User.passwordHash String?` eklendi (docs/05 "şifreler
  hash'lenir"). Nullable — ileride OAuth/adapter kullanıcısı için. Migration
  ÇALIŞTIRILMADI (gerçek DB yok); ilk `prisma migrate dev --name init` ile gelecek.
  backend-engineer ile ortak `packages/db` üzerinden koordine — kopyalama yok.
- **Env gereksinimleri:** `AUTH_SECRET` (zorunlu, `openssl rand -base64 32`);
  `DATABASE_URL`/`DIRECT_URL` (web ile aynı Supabase); `NEXT_PUBLIC_SUPABASE_URL` +
  `SUPABASE_SERVICE_ROLE_KEY` (imzalı URL). İlk admin: `ADMIN_EMAIL`+`ADMIN_PASSWORD`
  (+`ADMIN_NAME`) ile `pnpm --filter @do/db seed:admin` (README'de).
- **Doğrulama:** `pnpm typecheck` (5/5 ✓), `pnpm build` (web+admin ✓; admin 6 rota +
  middleware 87.4 kB). Gerçek DB/Storage YOK → çalışma zamanı uçtan uca test Aşama 6'da.
- **Notlar / yer tutucular / varsayımlar:**
  - **Varsayım (auth modeli):** Credentials + JWT oturumu seçildi (tek admin, docs/04
    "adapter ile eklenir" notuna uygun ama JWT olduğu için Account/Session tablosu
    GEREKMEDİ). DB session/OAuth istenirse adapter + tablolar eklenir.
  - **Varsayım (durum geçişleri):** docs/05 ileri akış + her aşamadan IPTAL; ek olarak
    yanlış işaretlemeyi düzeltmek için geri dönüş (örn. POLICE_YAPILDI→YENI) izinli
    bırakıldı. docs/05 audit log (`🔧`) netleşince kısıtlanabilir (`crm.ts`).
  - **Varsayım (WhatsApp no):** TR heuristiği (0→90, 10 hane 5xx→90) `contact.ts`'te.
  - **Varsayım (payload eşlemesi):** detay sayfası ortak alanları (adSoyad / type tel /
    type email) ve `file` alanlarını payload listesinden hariç tutar (submit-quote ile
    tutarlı). Definisyonda olmayan payload anahtarı varsa ham gösterilir.
  - **TS2742 (NextAuth v5 beta):** çıkarımlı dönüş tipi @auth/core iç yollarına referans
    verdiği için `auth.ts`'te export'lar `NextAuthResult[...]` ile, `auth.config.ts`
    `NextAuthConfig` ile açıkça anotlandı.
  - **jose/Edge uyarısı:** build sırasında @auth/core→jose için Edge runtime uyarısı
    görülebilir (CompressionStream); JWT doğrulama Edge'de çalışır, build başarılı.
  - **Engel/açık (docs/05 🔧):** Excel/CSV dışa aktarma, audit log, çoklu admin/rol,
    panel istatistik/grafik HENÜZ YOK (dökümanda "netleşecek"). İstenirse Aşama 4-6.

---

### 2026-06-04 — web-builder — Aşama 4: Hesaplayıcılar (BES / Sağlık / Hayat) + Hayat ürünü

- **Ne:** docs/08 "Aşama 4 — Hesaplayıcılar" uygulandı. Üç etkileşimli hesaplayıcı
  (BES birikim, Sağlık prim tahmini, Hayat prim tahmini) gerçek (etkileşimli) hâle
  getirildi; ürün detay sayfasındaki `calculator-placeholder.tsx` yer tutucusu kaldırıldı.
  Ayrıca docs/03 §4'teki **Hayat Sigortası ürünü** kataloğa eklendi.
- **Neden:** docs/08 Aşama 4 çıktısı ("etkileşimli hesaplayıcılar dönüşümü artırıyor").
  Hayat Aşama 1'de yoktu; hesaplayıcısı bu aşamada planlandığı için ürün de şimdi eklendi.
- **Dokunulan dosyalar:**
  - **Ürün/hesap mantığı (packages/products):**
    `src/definitions.ts` (Hayat ürünü + katalog kaydı; `sensitive: true`,
    `hasCalculator: true`, `calculator: "hayat"`), `src/types.ts` (CalculatorKind yorum
    güncellemesi), `src/calculators/index.ts` (export'lar), **YENİ**
    `src/calculators/constants.ts` (TÜM katsayı/oran/limitler), **YENİ**
    `src/calculators/formulas.ts` (saf fonksiyonlar: `calculateBes/Saglik/Hayat`),
    `package.json` (`"./calculators"` export eklendi).
  - **Web (apps/web):** `src/app/[locale]/planlar/[slug]/page.tsx` (placeholder yerine
    `ProductCalculator`), **SİLİNDİ** `.../calculator-placeholder.tsx`, **YENİ**
    `src/components/calculators/{ui,bes-calculator,saglik-calculator,hayat-calculator,
product-calculator}.tsx`, `src/components/product-icon.tsx` (HeartHandshake ikonu),
    `src/components/auto-form/auto-form.tsx` (opsiyonel `defaultValues` prop — yumuşak
    geçiş), `src/messages/{tr,en}.json` (hesaplayıcı girdi/sonuç/uyarı metinleri;
    kullanılmayan `phase4Placeholder` kaldırıldı).
- **İlgili döküman/karar:** Aşama 4, docs/03 (Hesaplayıcılar + §4 Hayat ürünü), docs/09
  (UI: yuvarlak kart, teal/turuncu aksan, teal focus ring), docs/06 (Hayat = özel
  nitelikli → 2. rıza, `sensitive`).
- **⚠️ YER TUTUCU FORMÜL UYARISI:** Tüm hesaplama katsayı/oran/limitleri TAHMİNİ'dir,
  gerçek mevzuat/tarife DEĞİLDİR. **Gerçek değerler geldiğinde DEĞİŞECEK TEK NOKTA:**
  `packages/products/src/calculators/constants.ts` (BES/SAGLIK/HAYAT sabit nesneleri).
  `formulas.ts` saf fonksiyonları ve tipler değişmeden kalacak şekilde tasarlandı. Her
  sabit `// TODO(doc):` ile işaretli. docs/03 gereği her hesaplayıcı sonucunda
  **"Tahmini değerdir, kesin teklif için form doldurun"** uyarısı (EstimateNotice) ZORUNLU
  ve belirgin gösteriliyor; ALTINDA mevcut AutoForm teklif formu duruyor.
- **Doğrulama:** `pnpm typecheck` (5/5 ✓), `pnpm build` (web+admin ✓). Web
  `/[locale]/planlar/[slug]` 10 statik path üretiyor (5 ürün × 2 dil; Hayat dahil).
- **Notlar / varsayımlar:**
  - **Varsayım (BES formülü):** docs/03 taslak formülüne sadık + devlet katkısına YILLIK
    ÜST SINIR eklendi (gerçekte asgari ücrete endeksli → `annualStateContributionCap`
    yer tutucu). Bileşik getiri aylık annuity gelecek değeri ile hesaplanıyor.
  - **Varsayım (Sağlık/Hayat):** Sonuç tek sayı değil ±%20'lik bir ARALIK
    (`rangeSpread`) olarak verildi — "kaba aralık" istendiği için. Yaş/SGK/aile (sağlık)
    ve yaş/teminat/süre/sigara (hayat) basit çarpan mantığıyla.
  - **Varsayım (Konut/DASK):** docs/03 "opsiyonel — istenirse" → bu aşamada ATLANDI;
    `constants.ts`/`formulas.ts`/page'de `// TODO(doc)` notu bırakıldı.
  - **Varsayım (yumuşak geçiş):** docs/08 madde 4 "ön-doldurma OPSİYONEL". Hesaplayıcıda
    "Bu değerlerle teklif al" butonu ilgili form alanlarını (BES→aylikTutar; Sağlık→
    kapsam/kişi sayısı; Hayat→teminat/süre/sigara) doldurur ve forma yumuşak kaydırır.
    AutoForm `defaultValues` mount'ta okunduğundan `ProductCalculator` formu `key` ile
    yeniden monte eder.
  - **Varsayım (Hayat `sensitive`):** docs/03 §4 notu "sağlık durumu sorulursa özel
    nitelikli" + sigara beyanı alındığından ürün ve `sigara` alanı `sensitive: true`
    işaretlendi → form 2. (özel nitelikli) rıza kutusunu otomatik gösteriyor (mevcut
    AutoForm mantığı). Onay gerekirse geri alınabilir.

---

## 2026-06-04 — Aşama 5: İçerik & Cila (web-builder)

- **Agent:** web-builder
- **Ne / Neden:** docs/08 "Aşama 5 — İçerik & Cila". Site iskeleti (Aşama 0-4) hazırdı
  ancak `messages/{tr,en}.json` Aşama 0 ISKELET'inde kalmıştı; sayfa/bileşenlerin
  (anasayfa, header, footer, top-bar, hero kartı, hakkımda, iletişim) referans verdiği
  onlarca i18n anahtarı (nav/topbar/footer/meta/about/contact/home.\* vb.) JSON'da YOKTU.
  Bu aşamada içerik (TR+EN) tamamlandı, eksik sayfalar eklendi ve SEO altyapısı kuruldu.
- **Dokunulan / yeni dosyalar (apps/web):**
  - **İçerik (TR+EN):** `src/messages/tr.json` + `src/messages/en.json` — TÜM namespace'ler
    eklendi/yeniden yazıldı: `common` (whatsappPrefill/Aria, callAria, contact), `meta`
    (homeTitle/homeDescription), `nav`, `topbar`, `home` (heroBadge/heroTitle-rich/stats/
    steps/branches/faq/final/trustLabel), `heroCard`, `about`, `contact` (+ geri-arama
    form metinleri), `faqPage`, `footer`. Mevcut `form/cookie/legal/calculator/plans`
    korundu.
  - **YENİ sayfa:** `src/app/[locale]/sss/page.tsx` — SSS sayfası (lib/faq.ts tek kaynak),
    akordeon + iletişim CTA + **FAQPage JSON-LD** + tekil title/meta + hreflang/canonical.
  - **YENİ bileşen:** `src/components/contact-form.tsx` — iletişim/geri-arama formu
    (RHF kullanmadan hafif; girdileri WhatsApp mesajına dönüştürür → backend mantığı
    uydurulmadı). `src/components/social-icons.tsx` — Instagram/LinkedIn/Facebook inline
    SVG (lucide-react v1.x marka ikonlarını kaldırdığı için typecheck KIRIKTI; düzeltildi).
  - **İletişim sayfası:** `src/app/[locale]/iletisim/page.tsx` — geri-arama formu eklendi
    (2 sütun: form | adres+harita).
  - **SEO altyapısı (YENİ):** `src/app/sitemap.ts` (TR+EN tüm sayfa+ürün, hreflang
    alternates), `src/app/robots.ts`, `src/app/manifest.ts`, `src/app/icon.tsx` +
    `apple-icon.tsx` (favicon "DÖ" wordmark baş harfinden — docs/09), `opengraph-image.tsx`
    (1200×630 marka görseli: lacivert zemin + turuncu vurgu + radyal ışıma).
  - **Kök metadata:** `src/app/layout.tsx` — `metadataBase` eklendi (OG mutlak URL).
    `src/app/[locale]/layout.tsx` — org JSON-LD `image` → `/opengraph-image`.
  - **Middleware:** `src/middleware.ts` — matcher'a `icon|apple-icon|opengraph-image|
manifest.webmanifest|sitemap.xml|robots.txt` HARİÇ tutuldu (next-intl bu kök asset
    route'larını `/tr/...`'e 307 yönlendirip favicon/OG'yi kırıyordu; düzeltildi).
  - **Temizlik:** `hakkimda/page.tsx` kullanılmayan `Locale` tip aliası kaldırıldı (lint).
- **İlgili döküman/karar:** Aşama 5, docs/02 (sayfa listesi + İletişim bilgileri + SSS),
  docs/07 (SEO her detayda: sitemap/robots/JSON-LD/hreflang/canonical/OG), docs/09
  (anasayfa düzeni, palet, tipografi, mikro-etkileşim, "müşteri yorumu YOK").
- **Doğrulama:** `pnpm typecheck` (5/5 ✓), `pnpm build` (web+admin ✓). Web 35 statik sayfa
  (anasayfa, planlar, planlar/[slug]×10, hakkımda, iletişim, sss, 3 yasal — her biri ×2
  dil + 6 metadata route). Prod sunucuda doğrulandı: home/SSS/iletişim/EN sayfaları render
  (i18n anahtarları çözülüyor, heroTitle rich `<em>en uygun</em>` çalışıyor), FAQPage &
  InsuranceAgency JSON-LD basılıyor, robots.txt/sitemap.xml (hreflang ile), icon/og/apple
  PNG 200 dönüyor, canonical+hreflang(tr/en/x-default) head'de.
- **Notlar / VARSAYIMLAR (UYDURMA değil — işaretli):**
  - **⚠️ Anlaşmalı şirket listesi** hâlâ YER TUTUCU (`lib/site.ts` partnerCompanies,
    `// TODO(doc)`). docs/09 "🔧 netleşecek". Doğukan'ın gerçek listesi gelince değişir.
  - **⚠️ Görsel kaynakları:** docs/09 "🔧 Doğukan'ın fotoğrafı/ofis görseli" GELMEDİ →
    fotoğraf KULLANILMADI; hero/hakkımda metin+SVG+gradyan ile kuruldu (next/image hazır,
    görsel gelince eklenebilir). OG/favicon "DÖ" baş harfinden türetildi.
  - **Varsayım (istatistik şeridi):** docs/09 hero "istatistik şeridi" istiyor ama docs
    "müşteri sayısı/yorum YOK" diyor → UYDURMA müşteri sayısı yerine doğrulanabilir
    ifadeler kullanıldı: "20+ Anlaşmalı şirket", "Tüm branşlar / Trafikten hayata",
    "Hızlı / Ortalama dönüş". heroBadge'de referanstaki "4.9/5 Google yorumu" YERİNE
    "Bağımsız acente — 20+ şirketi karşılaştırır" kondu (yorum yasağı).
  - **Varsayım (geri-arama formu):** Genel iletişim formu, backend Server Action yerine
    WhatsApp'a mesaj derleyerek iletiyor (hero-quote-card ile aynı "backend uydurma"
    deseni). İstenirse ayrı Server Action (e-posta/CRM) eklenebilir — `// TODO(doc)`.
  - **Varsayım (sosyal medya):** footer linkleri `#` placeholder (lib/site.ts) — gerçek
    hesaplar gelince güncellenir.
  - **Varsayım (harita):** koordinat/Place ID yok → adres-arama embed (mapEmbedUrl).
- **Aşama 6'ya kalanlar:** gerçek anlaşmalı şirket listesi + logoları, Doğukan'ın
  fotoğrafı/ofis görselleri (next/image), gerçek harita koordinatı, analitik (çerez
  onayına bağlı), hukukçu onaylı yasal metinler, EN içeriklerin nihai redaksiyonu.

### [2026-06-04] — Aşama 6 hazırlık: 301 yönlendirmeler, deploy runbook, onaylı analitik, devir

- **Agent:** setup-engineer
- **Ne:** Aşama 6 "Yayın & Devir" hazırlık çıktıları (gerçek Supabase/Vercel/domain
  hesapları kullanıcıda olmadığından RUNBOOK + otomasyon + devir odaklı):
  1. **Eski site → yeni site 301 yönlendirmeleri.** Eski statik site (`C:\...\Yazılımlar\
dogukanozgan.com`) HTML dosyaları tarandı; `apps/web/next.config.mjs`'e
     `redirects()` eklendi (`permanent: true`): `/index.html`→`/tr`,
     `/hakkimda.html`→`/tr/hakkimda`, `/iletisim.html`→`/tr/iletisim`,
     `/planlar.html`→`/tr/planlar`, `/planlar/saglik-sigortasi.html`→`/tr/planlar/saglik`,
     `/planlar/trafik.html`→`/tr/planlar/trafik`, `/planlar/konut.html`→`/tr/planlar/konut`,
     `/planlar/bireysel-emeklilik.html`→`/tr/planlar/bireysel-emeklilik`. Slug'lar
     `packages/products/definitions.ts` ile birebir.
  2. **Onaya bağlı analitik iskeleti (KVKK).** `apps/web/src/lib/consent.ts` (paylaşılan
     onay anahtarı/olay), `apps/web/src/components/analytics.tsx` (Plausible/GA4 iskeleti,
     YALNIZCA "all" onayında yüklenir), locale layout'a `<Analytics/>` eklendi.
     `cookie-consent.tsx` ortak `writeConsent` kullanacak şekilde refactor edildi
     (banner seçimi olay yayar → analitik anında tepki verir). Web `.env.example`'a
     `NEXT_PUBLIC_ANALYTICS_PROVIDER/PLAUSIBLE_DOMAIN/GA4_ID` eklendi (boşsa hiçbir şey
     yüklenmez).
  3. **Deploy runbook** `docs/10-deploy-yayin.md` (Supabase proje + bağlantı dizeleri +
     `quote-assets` private bucket, ilk `migrate dev --name init` → `migrate deploy`,
     `seed:admin`, `AUTH_SECRET`, iki Vercel projesi root dir/env/build, domain DNS,
     **tüm env tek tablo**). `packages/db` package.json'a `migrate:deploy` scripti eklendi.
  4. **Go-live checklist** `docs/11-go-live-checklist.md` (DEV/USR/LAW lejantlı).
  5. **Kullanım kılavuzu** `teslim/kullanim-kilavuzu.md` (Doğukan için sade TR: giriş,
     filtreleme, durum, not, WhatsApp/ara, KVKK silme, ürün/şirket güncelleme talebi).
  6. `docs/README.md` indeksine 10/11 + teslim kılavuzu linklendi.
- **Neden:** docs/08 Aşama 6 — eski site SEO link-değerini koru (301), yayın sürecini
  tekrarlanabilir kıl, KVKK'ya (docs/06 §3) uygun onaylı analitik, Doğukan'a devir.
- **Dosyalar:** `apps/web/next.config.mjs`, `apps/web/src/lib/consent.ts` (yeni),
  `apps/web/src/components/analytics.tsx` (yeni), `apps/web/src/components/cookie-consent.tsx`,
  `apps/web/src/app/[locale]/layout.tsx`, `apps/web/.env.example`, `packages/db/package.json`,
  `docs/10-deploy-yayin.md` (yeni), `docs/11-go-live-checklist.md` (yeni),
  `teslim/kullanim-kilavuzu.md` (yeni), `docs/README.md`.
- **İlgili döküman/karar:** Aşama 6, docs/01 (deploy/domain/env), docs/06 (KVKK analitik
  onayı), docs/05 (admin/CRM — kullanım kılavuzu).
- **Doğrulama:** `pnpm build` 2/2 başarılı (web+admin). `routes-manifest.json`'da tüm 8
  yönlendirme kayıtlı.
- **Notlar / VARSAYIMLAR (UYDURMA değil — işaretli):**
  - **308 vs 301:** Next.js `permanent: true` → HTTP **308** üretir (301 değil). 308
    "Permanent Redirect"tir; SEO link-değeri aktarımında 301 ile eşdeğer kabul edilir.
    Beklenen/doğru davranıştır, bug değildir.
  - **Eski "hayat.html" YOK:** Eski sitede hayat ürünü ayrı sayfa değildi; yeni
    `/tr/planlar/hayat` için eski karşılık yok (`// TODO(doc)`).
  - **Trailing-slash/www varyantları:** Gerekirse Vercel domain ayarlarından (`// TODO(doc)`).
  - **Analitik aracı/ID belirsiz** (docs/06 "🔧 netleşecek") → iskelet hazır, env boş →
    yüklenmez. Doğukan Plausible/GA4/yok kararı + ID verince aktif olur.
  - **Migration klasörü henüz YOK:** Runbook'ta ilk `migrate dev --name init` adımı
    vurgulandı (bugüne dek dev push ile çalışıldı).
- **Kullanıcıdan (Doğukan) yayın için BEKLENENLER:** (1) Supabase projesi + DB +
  `quote-assets` private bucket, (2) Vercel hesabı (iki proje), (3) domain DNS erişimi
  (apex+www+admin), (4) hukukçu onaylı KVKK/aydınlatma/gizlilik/çerez metinleri +
  saklama süresi, (5) gerçek içerik (anlaşmalı şirketler+logolar, nihai form alanları,
  hesaplayıcı formülleri, fotoğraf/ofis görseli, sosyal medya, harita koordinatı),
  (6) analitik kararı + ID, (7) gerekirse VERBİS kaydı.

### [2026-06-06] — Uyum Denetimi (salt-okunur QA)

- **Agent:** qa-compliance
- **Ne:** Aşama 0-6 sonrası kapsamlı uyum denetimi yapıldı (docs/00-11 baz). Kod değiştirilmedi.
  Sonuç: GENEL UYUM = YEŞİL. `pnpm typecheck` ✅, `pnpm lint` ✅ (0 uyarı), `pnpm build` ✅
  (web 35 statik sayfa). Veri modeli docs/04 ile birebir; KVKK akışı (zorunlu rıza +
  sağlık/hayat 2. rıza istemci+SUNUCU, rıza kanıtı IP/UA/zaman, private bucket + imzalı URL,
  silme/anonimleştirme, çerez onayına bağlı analitik, admin noindex+korumalı) docs/06 ile
  uyumlu. Tasarım token'dan; müşteri yorumu/blog yok; prefers-reduced-motion + focus-visible var.
  SEO: generateMetadata/sitemap/robots/JSON-LD (InsuranceAgency+FAQPage+Service)/hreflang/OG mevcut.
  Yer tutucular (formül/form/şirket/yasal) // TODO(doc) ile düzgün işaretli — uydurma yok.
- **Neden:** CLAUDE.md Kural 1 (dökümana bağlılık) doğrulaması; go-live öncesi kalite kapısı.
- **Dosyalar:** (salt-okunur) — yalnızca bu kayıt eklendi.
- **İlgili döküman/karar:** docs/02, docs/04, docs/06, docs/07, docs/09, Aşama 0-6
- **Notlar / yer tutucular:** Açık bulgular (kod sahibine): (1) DÜŞÜK — EN yol yerelleştirmesi
  yok: docs/02/07 örneği `/en/plans/traffic` iken kod `/en/planlar/...` üretiyor (next-intl
  `pathnames` tanımlı değil). Örnek illüstratif olabilir; ürün kararı gerekir. (2) DÜŞÜK —
  rate-limit ve retention bellek-içi/null (TODO(doc) işaretli, beklenen). (3) BİLGİ — testler
  yok (docs test zorunlu kılmıyor; saf hesaplayıcılar test edilebilir durumda).

### [2026-06-04] — İngilizce yol + slug yerelleştirmesi (i18n routing)

- **Agent:** web-builder
- **Ne:** EN sayfalar artık EN yol + EN slug ile yayınlanıyor (docs/02/07 örnekleriyle
  uyumlu): TR kanonik kalır, EN'de hem statik yol parçaları hem ürün slug'ları çevrilir.
  - **next-intl `pathnames`** tanımlandı (`routing.ts`): /planlar→/plans, /hakkimda→/about,
    /iletisim→/contact, /sss→/faq, /kvkk→/privacy-notice, /gizlilik→/privacy,
    /cerez-politikasi→/cookie-policy. İç (kanonik) yol TR klasör yapısıyla aynı; next-intl
    Link/router/usePathname yerel yola otomatik çevirir.
  - **Ürün slug yerelleştirmesi:** `ProductDefinition.slugs: {tr,en}` eklendi (kanonik
    `slug` = `slugs.tr` korundu, mevcut kullanımlar kırılmadı). Eşleme: trafik→traffic,
    saglik→health, bireysel-emeklilik→private-pension, hayat→life, konut→home-insurance.
    Yardımcılar: `getLocalizedSlug`, `getProductByLocalizedSlug`, `getLocalizedProductSlugs`.
  - **Rotalar:** `/[locale]/planlar/[slug]` params.slug locale'e göre çözülür
    (`getProductByLocalizedSlug`); `generateStaticParams` her locale için YEREL slug üretir.
    Tüm dahili linkler (header/footer/branş kartları/hero kartı/CTA) yerel yol/slug kullanır
    (next-intl Link `{pathname:"/planlar/[slug]", params:{slug}}` + statik yollar otomatik).
  - **SEO:** Yeni `lib/seo.ts` `localizedAlternates()` — canonical + hreflang (tr/en/x-default)
    her locale'in YEREL yoluna işaret eder. Tüm sayfaların generateMetadata'sı bu helper'a
    geçirildi; ürün JSON-LD `url` ve iletişim LocalBusiness `url` yerelleştirildi.
  - **sitemap.ts** yerel yolları + doğru `xhtml:link` alternates üretir.
  - **Dil değiştirici** ürün detayında slug'ı da çevirir (trafik↔traffic); statik sayfalarda
    kanonik pathname üzerinden router.replace ile hedef locale yerel yola geçer.
  - **301:** next.config redirects DEĞİŞMEDİ — eski site → yeni TR rotaları (TR kanonik).
- **Neden:** docs/02 (~satır 4) ve docs/07 (~satır 7) `/en/plans/traffic` örneğiyle uyum;
  qa-compliance 2026-06-06 denetimindeki DÜŞÜK bulgu #1'in (EN yol yerelleştirmesi yok)
  giderilmesi. Kullanıcı (Doğukan) onaylı görev.
- **Dosyalar:** docs/02, docs/03, docs/07 (yol+slug eşleme tabloları belgelendi — Kural 1:
  önce döküman); packages/products/src/{types.ts,definitions.ts}; apps/web/src/i18n/routing.ts;
  apps/web/src/lib/seo.ts (yeni); apps/web/src/app/sitemap.ts; apps/web/src/app/[locale]/
  {layout.tsx,page.tsx,planlar/page.tsx,planlar/[slug]/page.tsx,hakkimda/page.tsx,
  iletisim/page.tsx,sss/page.tsx,kvkk/page.tsx,gizlilik/page.tsx,cerez-politikasi/page.tsx};
  apps/web/src/components/{language-switcher.tsx,layout/footer.tsx,home/hero-quote-card.tsx,
  auto-form/auto-form.tsx}.
- **İlgili döküman/karar:** docs/02 (yol tablosu), docs/03 (slug tablosu), docs/07 (i18n SEO).
- **Doğrulama:** `pnpm typecheck` ✅, `pnpm build` ✅. Prerender doğrulandı: TR 5 + EN 5
  ürün sayfası; EN yerel yollar üretildi (canonical /en/plans/traffic, /en/faq,
  /en/privacy-notice…). hreflang çiftleri simetrik (tr↔en yerel yollar). sitemap yerel
  URL + alternates doğru. Kullanıcı-facing EN URL (/en/plans/health) iç prerender'a
  (/en/planlar/health) next-intl middleware ile REWRITE edilir (redirect değil → SEO sağlam).
- **Notlar / yer tutucular:** VARSAYIM — konut EN slug'ı `home-insurance` seçildi (yalın
  `home` anasayfa/genel "home" ile karışmasın); docs/03'e işlendi, `slugs.en` tek noktadan
  değişir. Yasal sayfa EN karşılıkları (privacy-notice/privacy/cookie-policy) mantıklı EN
  terimlerinden seçildi, docs/02'ye işlendi. Doğukan farklı isterse routing.ts pathnames +
  definitions.ts slugs.en güncellenir.

### [2026-06-04] — K25: Veritabanı MongoDB + depolama Vercel Blob'a geçirildi

- **Agent:** main (backend-engineer 529 API hatasıyla yarıda kaldı → main tamamladı)
- **Ne:** Kullanıcı kararıyla (onaylı sapma) DB Supabase PostgreSQL → **MongoDB** (Prisma
  `mongodb` provider, tüm id'ler `@db.ObjectId`, `prisma migrate` yerine `prisma db push`);
  dosya depolama Supabase Storage → **Vercel Blob**. backend-engineer şema + storage.ts +
  package.json + docs(00/01/04/06/10/11)'i yaptı. 529 sonrası main şunları bitirdi:
  3 `.env.example` (mongodb+srv + BLOB_READ_WRITE_TOKEN; DIRECT_URL/Supabase kaldırıldı),
  kök `.vercelignore`, `.gitignore` notu, submit-quote.ts (Blob URL → Asset.url),
  admin teklif detayı (createSignedUrl → doğrudan Asset.url), kvkk.ts (anonimleştirmede
  payload `{}`), storage.ts put body Buffer'a çevrildi.
- **Neden:** Kullanıcı MongoDB + Vercel Blob kullanacak (deploy Vercel'de tek platform).
- **Dosyalar:** packages/db/{prisma/schema.prisma, src/{storage,kvkk}.ts, package.json,
  .env.example}, apps/web/{src/lib/submit-quote.ts, .env.example}, apps/admin/{src/app/
  teklifler/[id]/page.tsx, .env.example}, .vercelignore (yeni), .gitignore,
  docs/{00,01,04,06,10,11}, docs/project-history.md (bu kayıt).
- **İlgili döküman/karar:** K25 (docs/00 karar günlüğü), docs/01/04/06/10/11.
- **Doğrulama:** pnpm install ✅, db:generate (mongodb) ✅, typecheck 5/5 ✅, build 2/2 ✅
  (web 35 sayfa + admin).
- **Notlar / yer tutucular:** Canlı Mongo YOK → `db push` çalıştırılmadı (gerçek
  DATABASE_URL gelince). KULLANICIDAN: MongoDB Atlas `DATABASE_URL` + Vercel
  `BLOB_READ_WRITE_TOKEN`. KVKK (docs/06 §5b): Blob URL'leri tahmin-edilemez ama
  "public-stil"dir → ruhsat/araç fotoğrafları YALNIZCA kimlik-doğrulamalı admin
  ekranında gösterilir, indekslenmez, işlem sonrası silinebilir (artık-risk notu).

### [2026-06-04] — Tanım↔Teklif ayrımı, zengin planlar/hakkımda, KVKK modal+scroll rıza

- **Agent:** web-builder
- **Ne:** Dört iş yapıldı (Kural 1 gereği önce docs güncellendi, sonra kod):
  - **(1) Tanım/Reklam ↔ Teklif AYRIMI.** Eskiden `/[locale]/planlar/[slug]` hem tanıtım+
    hesaplayıcı hem teklif formunu içeriyordu. Artık:
    - **Tanım/reklam** = `/[locale]/planlar/[slug]` (EN: `/en/plans/[slug]`): hero+tanıtım,
      kapsam, avantajlar, neden Doğukan, (varsa) HESAPLAYICI, ürün SSS, "Teklif Al" CTA.
      **Form KALDIRILDI** (HTML'de `<form>` yok — doğrulandı). Hesaplayıcıdaki "bu değerlerle
      teklif al" teklif sayfasına gider; değerler query ile ön-doldurulur.
    - **Teklif (form)** = YENİ rota `/[locale]/planlar/[slug]/teklif` (EN: `/en/plans/[slug]/quote`):
      SADECE AutoForm (KVKK modal'lı). Üstte tanım sayfasına geri link + ürün başlığı.
      Hesaplayıcı YOK. Query prefill CLIENT'ta okunur (`PrefilledAutoForm` + `useSearchParams`
      - `<Suspense>`) → sayfa STATİK (SSG) kalır.
    - next-intl `pathnames`e `/planlar/[slug]/teklif` eklendi (tr `/planlar/[slug]/teklif`,
      en `/plans/[slug]/quote`). `StaticPathname` tipi yeni dinamik yolu da dışladı.
      `lib/seo.ts` + `sitemap.ts` teklif yolunu da yerelleştirir; dil değiştirici regex'i
      teklif/quote alt segmentini de yakalayıp slug'ı çevirir. Eski 301'ler DEĞİŞMEDİ
      (tanım sayfasına = TR kanonik gider). Header/footer/branş kartı/anasayfa/hero kartı
      linkleri TANIM sayfasına işaret etmeye devam ediyor (tanıtım niyeti).
  - **(2) Planlar listesi UZUN landing:** giriş + neden acente (3 kart) + zengin açıklamalı
    ürün kartları (intro + ilk 3 kapsam maddesi) + nasıl çalışır (3 adım) + anlaşmalı şirket
    güven şeridi + kısa SSS (FaqAccordion) + kapanış CTA + FAQPage JSON-LD.
  - **(3) Hakkımda UZUN:** hero+istatistik şeridi · hikâye/deneyim · çalışma yaklaşımı ·
    değerler · branşlar (definitions'tan, tanım sayfasına linkli) · "nasıl çalışırım" süreci
    (3 adım) · anlaşmalı şirketler şeridi · kapanış CTA. TR+EN.
  - **(4) KVKK rıza: MODAL + SCROLL kapısı.** Yeni `consent-field.tsx`: rıza kutusu, kullanıcı
    aydınlatma metnini MODAL'da açıp EN ALTA kadar OKUYANA kadar disabled; okuyunca "Okudum
    ve onaylıyorum" aktifleşir, tıklanınca rıza işaretlenir. Okumadan kutuya tıklarsa modal
    açılır. Kısa metin de "okundu" sayılır (taşma yoksa). Erişilebilir: `role="dialog"`+
    `aria-modal`, focus tuzağı, ESC, body scroll kilidi, odak yönetimi. Sağlık/Hayat (sensitive) 2. rıza için AYNI desen, kendi açık rıza metni/modalı. Metinler TEK KAYNAKTAN
    (`components/legal/kvkk-content.tsx`) → /kvkk sayfası da bunu kullanır (içerik kopyalanmadı).
    Eski `ConsentCheckbox` ve kullanılmayan `product-calculator.tsx` silindi.
- **Neden:** Kullanıcı (Doğukan) onaylı görev: tanıtım↔dönüşüm ayrımı (sade form → daha
  yüksek dönüşüm + zengin SEO landing), daha dolu planlar/hakkımda sayfaları, bilinçli açık
  rıza (KVKK) UX'i.
- **Dosyalar:** docs/02 (yol tablosu + tanım/teklif satırları + ayrım notu), docs/03 (sayfa
  ayrımı bölümü + ortak kural rıza notu), docs/06 (§2a rıza-UX kuralı: modal+scroll+sensitive);
  apps/web/src/i18n/routing.ts; apps/web/src/lib/{seo.ts, product-content.ts(yeni)};
  apps/web/src/app/sitemap.ts; apps/web/src/app/[locale]/planlar/{page.tsx, [slug]/page.tsx,
  [slug]/teklif/page.tsx(yeni)}; apps/web/src/app/[locale]/{hakkimda/page.tsx, kvkk/page.tsx};
  apps/web/src/components/{language-switcher.tsx, faq-accordion.tsx,
  auto-form/{auto-form.tsx, consent-field.tsx(yeni), prefilled-auto-form.tsx(yeni), index.ts},
  calculators/calculator-section.tsx(yeni), legal/kvkk-content.tsx(yeni)};
  apps/web/src/messages/{tr.json, en.json}; SİLİNDİ: components/calculators/product-calculator.tsx.
- **İlgili döküman/karar:** docs/02 (tanım/teklif rota tablosu), docs/03 (sayfa ayrımı),
  docs/06 §2a (rıza modal+scroll-gate), docs/07 (i18n yol/hreflang), docs/09 (tasarım dili).
- **Doğrulama:** `pnpm typecheck` ✅ (5/5), `pnpm build` ✅ (web 45 sayfa + admin). Prerender
  doğrulandı: TANIM 10 (TR 5 + EN 5: /en/planlar/traffic… iç) ve TEKLİF 10 (/tr/planlar/
  trafik/teklif … /en/planlar/traffic/teklif iç) sayfa STATİK üretildi. EN kullanıcı yolu
  /en/plans/traffic/quote'a next-intl middleware ile REWRITE edilir (redirect değil → SEO
  sağlam). EN teklif HTML'inde canonical `/en/plans/traffic/quote`, hreflang çiftleri simetrik
  (tr:/tr/planlar/trafik/teklif ↔ en:/en/plans/traffic/quote, x-default→TR), tekil title
  ("Traffic Insurance — Get a Quote — Doğukan Özgan"). Tanım sayfası HTML'inde `<form>` YOK
  (form gerçekten kaldırıldı), hesaplayıcı + teklif CTA var. Dev sunucu BAŞLATILMADI.
- **Notlar / yer tutucular:** YER TUTUCU içerik `// TODO(doc)` ile işaretli:
  - `lib/product-content.ts` — ürün tanıtım metni/kapsam/avantaj/ürün-SSS (docs/03 taslak
    tablolarına göre makul placeholder; Doğukan'ın gerçek teminat/kapsam metinleri gelince
    tek dosyadan güncellenir).
  - Hakkımda hikâye/deneyim metinleri (`about.story1/2`, `approachBody` vb.) makul placeholder
    — Doğukan'ın gerçek biyografisi gelince messages/{tr,en}.json'dan güncellenir.
  - KVKK aydınlatma + özel-nitelikli açık rıza metinleri HÂLÂ taslak (hukukçu onayı bekliyor,
    docs/06 sorumluluk reddi); modal scroll-gate metnin OKUNMASINI zorlar ama içeriğin nihai
    olduğu anlamına gelmez.
  - VARSAYIM: EN teklif slug'ı "quote", alt segment routing.ts pathnames'ten tek noktadan
    değişir. Prefill query yalnız ürünün GERÇEK alan adlarıyla eşleşeni alır (güvenli filtre).

### [2026-06-04] — Yerel doğrulama ortamı: replica-set Mongo + admin kullanıcı + sunucular ayakta

- **Agent:** main (feature 1-4 ayrı kayıtta web-builder tarafından işlendi)
- **Ne:** Kullanıcının "admin'e giriş yapıp kontrol etmek istiyorum" talebi için yerel
  çalışma ortamı kuruldu: (1) Yerel MongoDB servisi standalone olduğundan Prisma yazma
  işlemleri P2031 verdi → ayrı portta (27018) **tek-düğümlü replica set (rs0)** mongod
  başlatıldı (mevcut servise dokunulmadı, elevation gerekmedi; dbpath: %TEMP%\do-mongo-rs;
  mongosh global kuruldu, rs.initiate ile PRIMARY). (2) Yerel `.env`/`.env.local`
  dosyaları (gitignore'da) → DATABASE_URL=mongodb://localhost:27018/...?replicaSet=rs0,
  AUTH_SECRET, AUTH_TRUST_HOST. (3) `db:push` ile şema senkronlandı. (4) `seed:admin`
  ile admin kullanıcı oluşturuldu. (5) admin (3001) + web (3000) dev sunucuları çalışıyor;
  gerçek giriş round-trip (CSRF→credentials→302→/teklifler 200) doğrulandı.
- **Kod değişikliği:** `packages/db/prisma/seed-admin.ts` — `upsert` (Prisma+Mongo'da
  transaction → replica set ister) yerine `findUnique` + `create`/`update` (idempotent,
  daha taşınabilir; standalone'da da çalışır). Bu kalıcı bir iyileştirmedir.
- **Neden:** Kullanıcının paneli gerçek veriyle/girişle yerelde incelemesi.
- **Dosyalar:** `packages/db/prisma/seed-admin.ts`; (gitignore'lu, commit edilmez)
  `packages/db/.env`, `apps/admin/.env.local`, `apps/web/.env.local`.
- **İlgili döküman/karar:** K25 (MongoDB), docs/05 (admin), docs/10 (deploy runbook).
- **Notlar / yer tutucular:** Bu replica-set yalnızca YEREL inceleme içindir (geçici
  arka plan süreci; reboot'ta gider). PROD'da MongoDB Atlas (zaten replica set) kullanılacak
  — runbook docs/10. Admin kimlik bilgileri kullanıcıya canlı olarak iletildi (doca yazılmadı).

### [2026-06-04] — Üç web düzeltmesi: EN dil değiştirici runtime hatası + hero select tasarımı + hesaplayıcı CTA

- **Agent:** web-builder
- **Ne:** (FIX 3 / kök neden) İngilizce sayfalara geçişte/dil değiştirmede oluşan
  "Insufficient params provided for localized pathname. Template: /plans/[slug]
  Params: undefined" runtime hatası giderildi. (FIX 1) Hero hızlı teklif kartındaki
  "Sigorta Türü" native <select> docs/09 diline uygun yeniden tasarlandı. (FIX 2)
  Ürün TANIM sayfasındaki hesaplayıcı etiketi net bir CTA'ya ("Hesaplayıcıya Git" /
  "Go to calculator") çevrildi ve aynı sayfadaki hesaplayıcı bölümüne yumuşak kaydırma
  bağlandı.
- **Neden:** Kullanıcı raporu (EN sayfada hata + hero select tasarımsız + hesaplayıcı
  butonu belirsiz).
- **KÖK NEDEN (FIX 3):** next-intl v4 `pathnames` ile `usePathname()` (createNavigation)
  İÇ/KANONİK ŞABLONU döndürür — örn. /en/plans/traffic için `/planlar/[slug]` (dikkat:
  `[slug]` GERÇEK değerle DOLDURULMAZ, literal kalır; getRoute() şablonu geri eşler).
  language-switcher bu yolu regex ile parçalayıp `match[1] = "[slug]"` alıyor,
  `getProductByLocalizedSlug(locale,"[slug]")` undefined dönüyor, fallback dalı
  `router.replace(pathname as StaticPathname)` = `router.replace("/planlar/[slug]")`
  dinamik şablonu PARAMS VERMEDEN string olarak geçiyordu → next-intl
  compileLocalizedPathname şablonda kalan `[slug]` için hatayı fırlatıyordu.
- **Düzeltme (FIX 3):** Slug DEĞERİ artık Next `useParams()`'tan, kanonik şablon
  `usePathname()`'den alınıyor. Dinamik ürün rotaları (`/planlar/[slug]`,
  `/planlar/[slug]/teklif`) `DYNAMIC_PRODUCT_PATHS` ile tip-güvenli ayırt ediliyor;
  bu rotalarda HER ZAMAN `{ pathname, params:{ slug } }` (hedef locale slug'ı
  definitions.ts üzerinden çözülerek) veriliyor — dinamik şablon ASLA params'sız
  geçilmiyor. Ürün çözülemezse güvenli şekilde `/planlar`'a düşülüyor. Statik yollar
  `StaticPathname` ile doğrudan. Diğer dinamik-pathname tüketicileri (lib/seo.ts,
  sitemap.ts, ürün sayfaları, hero-quote-card, calculator-section) zaten params
  veriyordu — tarandı, sorun yok.
- **Düzeltme (FIX 1):** native <select> korundu (mobil/a11y); wrapper + appearance:none
  - özel ChevronDown ikon (pointer-events-none) eklendi. Yuvarlak köşe (rounded-xl),
    ≥44px yükseklik (h-12), teal odak halkası (focus:ring-secondary), hover sınır vurgusu,
    seçim yokken soluk placeholder, seçeneklerde bg-card/text-foreground (light+dark
    okunaklı).
- **Düzeltme (FIX 2):** Yeni i18n anahtarı `plans.goToCalculator` (TR "Hesaplayıcıya Git",
  EN "Go to calculator"). Tanım sayfası butonu `tp("hasCalculator")` yerine bunu kullanıyor
  - Calculator ikonu. `#hesaplayici` anchor + bölümde mevcut `scroll-mt-24` zaten vardı;
    yumuşak kaydırma için `<html>`'e `scroll-smooth` eklendi (site geneli anchor'lar da
    yararlanır). Listeleme sayfasındaki `hasCalculator` rozeti DEĞİŞMEDİ.
- **Dosyalar:** `apps/web/src/components/language-switcher.tsx` (yeniden yazıldı),
  `apps/web/src/components/home/hero-quote-card.tsx`,
  `apps/web/src/app/[locale]/planlar/[slug]/page.tsx`,
  `apps/web/src/app/[locale]/layout.tsx` (html scroll-smooth),
  `apps/web/src/messages/tr.json`, `apps/web/src/messages/en.json`.
- **İlgili döküman/karar:** docs/02 (yol eşleme, teklif/tanım ayrımı), docs/03
  (hesaplayıcı CTA), docs/07 (i18n/next-intl), docs/09 (form/select tasarım dili).
- **Doğrulama:** `pnpm --filter @do/web typecheck` ✓ ve `pnpm --filter @do/web build` ✓
  (45/45 sayfa). EN tanım VE teklif sayfaları prerender edildi (manifest: /en/planlar/
  traffic|health|life|private-pension|home-insurance + .../teklif). Dev sunucu
  BAŞLATILMADI.
- **Notlar / varsayımlar:** scroll-smooth tüm sayfalara uygulanır (prefers-reduced-motion
  Tailwind utility'sinde otomatik değil; mevcut anchor'lar için kabul edilebilir gelişme).
  language-switcher fallback (`/planlar`) ürün her zaman çözüldüğü için pratikte tetiklenmez
  ama dinamik-şablon-params'sız hatasına karşı savunma olarak bırakıldı.

### [2026-06-04] — KVKK rıza kutusu: disabled yerine tıklanabilir (tık → modal)

- **Agent:** main
- **Ne:** Rıza kutusu önceki sürümde okunmadan `disabled` idi → tarayıcı tıklama olayını
  hiç tetiklemediği için "tıklanamaz" görünüyordu. `disabled` kaldırıldı; kutu artık
  TIKLANABİLİR. Okunmadan tıklanırsa `onClick`'te `preventDefault` ile işaretlenmez ve
  sözleşme MODAL'ı açılır; metin en alta okunup "Okudum ve onaylıyorum" denince normal
  işaretlenir. Soluk/cursor-not-allowed stili kaldırıldı (cursor-pointer).
- **Neden:** Kullanıcı geri bildirimi — kutu tamamen tıklanamaz olmuştu; tıklanabilir
  ama okunmadan tik atılamayan davranış istendi (docs/06 §2a ruhu korunur).
- **Dosyalar:** apps/web/src/components/auto-form/consent-field.tsx
- **İlgili döküman/karar:** docs/06 §2a (rıza-UX: modal + scroll kapısı).
- **Doğrulama:** pnpm --filter @do/web typecheck ✅; teklif sayfaları (TR/EN) 200.
