# 10 — Deploy & Yayın Runbook (Aşama 6)

> Bu döküman **adım adım yayın (go-live) rehberidir**. Kaynak: [08 Aşama 6](./08-yol-haritasi.md),
> [01 Mimari/Deploy](./01-teknoloji-mimari.md), [06 KVKK](./06-kvkk-yasal-uyum.md).
>
> ⚠️ Gerçek hesaplar (MongoDB Atlas, Vercel + Vercel Blob, domain DNS) **kullanıcı
> (Doğukan)** tarafından sağlanır. Bu runbook o hesaplar hazır olunca **birebir izlenir**.
> Sırasıyla gidin — her adım bir öncekine bağımlıdır.

İki ayrı Next.js uygulaması, **aynı MongoDB Atlas + Vercel Blob**'u paylaşır (K21, K25):

| Uygulama     | Domain                       | Vercel proje (öneri) | Root Directory |
| ------------ | ---------------------------- | -------------------- | -------------- |
| `apps/web`   | `dogukanozgan.com` (+ `www`) | `dogukanozgan-web`   | `apps/web`     |
| `apps/admin` | `admin.dogukanozgan.com`     | `dogukanozgan-admin` | `apps/admin`   |

---

## 0. Ön Koşullar (yayından önce hazır olmalı)

- [ ] GitHub'da repo (kod push'lanmış, `main` dalı).
- [ ] MongoDB Atlas hesabı + cluster.
- [ ] Vercel hesabı (GitHub bağlı) + Vercel Blob store.
- [ ] `dogukanozgan.com` domaini (DNS yönetimine erişim).
- [ ] Yerel makinede `pnpm` + Node 20+ (ilk `prisma db push` için).

---

## 1. MongoDB Atlas + Vercel Blob (K25)

### 1a. MongoDB Atlas cluster

1. **Yeni cluster oluştur** (Atlas → Build a Database; ücretsiz M0 başlangıç için yeterli).
   - Region: kullanıcıya yakın (örn. Frankfurt / `eu-central`).
   - **Database user** oluştur (güçlü şifre, sakla).
   - **Network Access**: Vercel sunucularından erişim için `0.0.0.0/0` (veya Vercel IP'leri)
     izin listesine eklenir.
2. **Bağlantı dizesini al** (Atlas → Connect → Drivers):
   - **`DATABASE_URL`** → `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbName>?retryWrites=true&w=majority`
   - Veritabanı adı (ör. `dogukanozgan`) URL içinde `/<dbName>` olarak belirtilmelidir.
   - Prisma `mongodb` provider **tek URL** kullanır; `DIRECT_URL` YOKTUR.

### 1b. Vercel Blob store

1. Vercel Dashboard → Storage → **Create → Blob** → store oluştur.
2. Oluşan **`BLOB_READ_WRITE_TOKEN`** değerini al (⚠️ GİZLİ — yalnızca sunucuda;
   asla istemciye sızmaz, asla repoya yazılmaz).
   - Token, her iki Vercel projesine de (web + admin) env olarak girilir.
   - Web app yükleme yapar; admin app görüntüleme/silme yapar — ikisi de aynı store.
   - Bucket/policy adımı YOK (Vercel Blob'da bucket kavramı yoktur; token erişimi yönetir).

---

## 2. Veritabanı Şeması (`prisma db push`)

> ⚠️ MongoDB'de **SQL migration dosyaları yoktur** (`prisma migrate` PostgreSQL'e
> özgüydü). Şema, `prisma db push` ile doğrudan cluster'a uygulanır — `migrations/`
> klasörü oluşmaz.

**Şemayı production cluster'a uygula (yerel makinede, bir kez / şema değiştikçe):**

```bash
# packages/db/.env içine gerçek DATABASE_URL (mongodb+srv) koyun, sonra:
pnpm --filter @do/db db:push        # = prisma db push
```

> `prisma db push` koleksiyonları/indeksleri şemaya göre senkronize eder. MongoDB
> şemasız olduğundan ek bir "deploy" adımı gerekmez; uygulama bağlandığında belgeler
> şemaya uygun yazılır.

---

## 3. İlk Admin Kullanıcı (seed)

Admin paneline giriş için en az bir `ADMIN` kullanıcı gerekir (docs/05).

```bash
# packages/db dizininde, gerçek DATABASE_URL bağlıyken:
ADMIN_EMAIL="dogukan@dogukanozgan.com" \
ADMIN_PASSWORD="GÜÇLÜ-ŞİFRE-EN-AZ-8-KARAKTER" \
ADMIN_NAME="Doğukan Özgan" \
  pnpm --filter @do/db seed:admin
```

- Script **idempotent**: kullanıcı varsa şifreyi günceller, yoksa oluşturur.
- Şifre bcrypt ile hash'lenir (düz metin saklanmaz).
- Şifreyi Doğukan'a **güvenli kanaldan** iletin; ilk girişten sonra değiştirsin
  (🔧 panelde şifre değiştirme akışı varsa kullanılır).

---

## 4. AUTH_SECRET Üretimi (admin)

Auth.js oturum çerezini şifreler. Bir kez üretip Vercel admin projesine girin:

```bash
openssl rand -base64 32
# Windows PowerShell alternatifi:
#   [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Max 256 }))
```

---

## 5. Vercel — İki Ayrı Proje

Her uygulama **ayrı Vercel projesi** (K21). Repo aynı; **Root Directory** farklı.

### 5a. Web projesi (`dogukanozgan-web`)

1. Vercel → Add New Project → repoyu seç.
2. **Root Directory: `apps/web`**.
3. Framework: Next.js (otomatik). Build/install komutları `apps/web/vercel.json`'dan
   gelir (`pnpm --filter @do/web build`, kökten `pnpm install`).
4. **Environment Variables** (Production + Preview): bkz. §7 tablosu (web sütunu).
5. Deploy.

### 5b. Admin projesi (`dogukanozgan-admin`)

1. Vercel → Add New Project → **aynı** repoyu seç.
2. **Root Directory: `apps/admin`**.
3. Build/install `apps/admin/vercel.json`'dan gelir.
4. **Environment Variables**: bkz. §7 tablosu (admin sütunu) — `AUTH_SECRET` dahil.
5. Deploy.

> Admin tamamen `noindex` (docs/01); arama motorlarına kapalı.

---

## 6. Domain Bağlama (DNS)

Vercel her proje için domain ekleme talimatını gösterir. Tipik kayıtlar:

| Domain                    | Vercel projesi | DNS kaydı (tipik)                               |
| ------------------------- | -------------- | ----------------------------------------------- |
| `dogukanozgan.com` (apex) | web            | `A` → `76.76.21.21` _(Vercel'in verdiği değer)_ |
| `www.dogukanozgan.com`    | web            | `CNAME` → `cname.vercel-dns.com`                |
| `admin.dogukanozgan.com`  | admin          | `CNAME` → `cname.vercel-dns.com`                |

> ⚠️ Kesin IP/CNAME değerlerini **Vercel'in Domains ekranındaki** talimat verir —
> yukarıdakiler örnektir. `www` → apex yönlendirmesini Vercel'de ayarlayın.
> **SSL** sertifikaları DNS doğrulanınca Vercel tarafından **otomatik** verilir.

---

## 7. Ortam Değişkenleri — Tek Tablo

> Kaynak: `apps/web/.env.example`, `apps/admin/.env.example`, docs/01.
> ⚠️ Gerçek değerler **yalnızca Vercel proje ayarlarında** (ve yerel `.env.local`'de).
> **Asla repoya commit edilmez.**

| Değişken                         | Web | Admin | Açıklama                                             |
| -------------------------------- | :-: | :---: | ---------------------------------------------------- |
| `DATABASE_URL`                   | ✅  |  ✅   | MongoDB Atlas (`mongodb+srv://...`)                  |
| `BLOB_READ_WRITE_TOKEN`          | ✅  |  ✅   | GİZLİ — Vercel Blob (yükleme/silme)                  |
| `NEXT_PUBLIC_SITE_URL`           | ✅  |   —   | `https://dogukanozgan.com`                           |
| `AUTH_SECRET`                    |  —  |  ✅   | Auth.js oturum şifreleme (`openssl rand -base64 32`) |
| `ADMIN_EMAIL`                    |  —  |  ✅   | İlk admin (seed + referans)                          |
| `NEXT_PUBLIC_ANALYTICS_PROVIDER` | ⬜  |   —   | `plausible` \| `ga4` \| boş (kapalı) — opsiyonel     |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`   | ⬜  |   —   | Plausible kullanılırsa                               |
| `NEXT_PUBLIC_GA4_ID`             | ⬜  |   —   | GA4 kullanılırsa                                     |

`ADMIN_PASSWORD` / `ADMIN_NAME` yalnızca **seed çalıştırılırken** gerekir (Vercel
runtime'a konmaz). ⬜ = opsiyonel (boşsa analitik yüklenmez).

---

## 8. Yayın Sonrası Doğrulama

- [ ] `https://dogukanozgan.com` açılıyor, `/` → `/tr` yönleniyor, SSL yeşil.
- [ ] Eski URL'ler 301 dönüyor (örn. `/planlar/trafik.html` → `/tr/planlar/trafik`).
      Bkz. `apps/web/next.config.mjs` `redirects()`.
- [ ] `robots.txt` + `sitemap.xml` erişilebilir; admin `noindex`.
- [ ] Bir test teklifi gönder → MongoDB `QuoteRequest` koleksiyonuna düştü mü.
- [ ] Trafikte foto yükle → Vercel Blob'a düştü, adminde Blob URL ile görünüyor.
- [ ] `admin.dogukanozgan.com` → giriş çalışıyor (seed kullanıcı), korumalı sayfalar
      auth istiyor.
- [ ] Çerez banner'ı çıkıyor; **analitik yalnızca "Tümünü kabul et" sonrası** yükleniyor.

---

## 9. Hatırlatma — Kullanıcıdan (Doğukan) Beklenenler

Teknik kurulum hazır; **şu içerik/karar kullanıcıdan** gelmeden site "tam" yayınlanmış
sayılmaz (bkz. [go-live checklist](./11-go-live-checklist.md)):

- MongoDB Atlas + Vercel hesapları (+ Vercel Blob store) ve domain DNS erişimi.
- Hukukçu onaylı **KVKK/aydınlatma/gizlilik/çerez** metinleri + **saklama süresi**.
- Gerçek **anlaşmalı şirket listesi** (+ logolar), Doğukan'ın **fotoğrafı/ofis görseli**.
- Gerçek **form alanları** ve **hesaplayıcı formülleri** (definitions.ts + calculators).
- Analitik kararı (Plausible/GA4/yok) ve varsa ID.
- Gerçek sosyal medya hesapları, harita koordinatı.
