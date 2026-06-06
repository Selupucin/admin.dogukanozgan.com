# 04 — Veri Modeli (Prisma + MongoDB)

Veritabanı **MongoDB Atlas**, erişim **Prisma ORM** (`mongodb` provider) ile (K25).
Aşağıdaki şema taslaktır; alanlar netleştikçe güncellenir.

> **MongoDB notları (K25):**
>
> - ID'ler `String @id @default(auto()) @map("_id") @db.ObjectId` (MongoDB ObjectId).
> - Tüm yabancı anahtar alanları (`quoteId` vb.) `@db.ObjectId` ile işaretlenir.
> - Şema değişiklikleri `prisma db push` ile uygulanır — MongoDB'de SQL migration
>   dosyaları yoktur (`prisma migrate` PostgreSQL'e özgüydü).
> - `directUrl` kullanılmaz; `mongodb+srv` tek bağlantı URL'i yeterlidir.
> - Model/alan **semantiği** (QuoteRequest/Note/User/Asset, `payload` Json, rıza
>   alanları, enum'lar, `@default(now())`) önceki Supabase tasarımıyla **birebir aynıdır**;
>   yalnızca ID tipi ve depolama (Vercel Blob) değişti.

## Tasarım Kararı: Dinamik Form Alanları Nasıl Saklanır?

Her ürünün formu farklı alanlara sahip (bkz. [03](./03-urunler-formlar-hesaplayicilar.md)).
İki yaklaşım vardı:

- **A) Her alan ayrı sütun** → her ürün/alan değişikliğinde migration gerekir. Esnek değil.
- **B) Ortak sütunlar + ürüne özel alanlar `JSON`** → ✅ **Seçilen.** Yeni alan eklemek
  migration gerektirmez; "form alanlarını sonra düzelteceğim" isteğiyle birebir uyumlu.

Yani: ad/telefon/ürün/durum gibi **ortak ve sorgulanan** alanlar gerçek sütun;
ürüne özel değişken alanlar `payload` (JSON) içinde.

## Prisma Şeması (Taslak)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

// Gelen teklif talepleri
model QuoteRequest {
  id          String      @id @default(auto()) @map("_id") @db.ObjectId
  product     String      // ürün slug: "trafik" | "saglik" | "bireysel-emeklilik" | "konut" ...
  locale      String      @default("tr") // formun dolduruldugu dil

  // Ortak iletişim alanları (sorgulanabilir olsun diye gerçek sütun)
  fullName    String
  phone       String
  email       String?

  // Ürüne özel tüm alanlar (TC, plaka, m², yaş, kronik hastalık vb.)
  payload     Json

  // KVKK rıza kayıtları (kanıt için ZORUNLU - bkz. 06)
  consentKvkk        Boolean   @default(false)
  consentSensitive   Boolean   @default(false) // saglik verisi vb. icin ayri riza
  consentAt          DateTime?
  consentIp          String?
  consentUserAgent   String?

  // CRM alanları
  status      QuoteStatus @default(YENI)
  notes       Note[]
  assets      Asset[]     // yüklenen fotoğraf/dosyalar (örn. trafikte ruhsat)

  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@index([product])
  @@index([status])
  @@index([createdAt])
}

// CRM durum akışı
enum QuoteStatus {
  YENI            // Yeni geldi
  ARANDI          // İletişime geçildi
  TEKLIF_VERILDI  // Teklif sunuldu
  POLICE_YAPILDI  // Satışa dönüştü
  IPTAL           // Vazgeçildi / ulaşılamadı
}

// Admin'in talebe eklediği notlar (CRM)
model Note {
  id        String       @id @default(auto()) @map("_id") @db.ObjectId
  quote     QuoteRequest @relation(fields: [quoteId], references: [id], onDelete: Cascade)
  quoteId   String       @db.ObjectId
  body      String
  createdAt DateTime     @default(now())
}

// Admin kullanıcılar (Auth.js)
model User {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  email     String   @unique
  name      String?
  role      Role     @default(ADMIN)
  createdAt DateTime @default(now())
  // Auth.js ek tabloları (Account, Session) adapter ile eklenir
}

enum Role {
  ADMIN
}

// Yüklenen dosya/fotoğraflar (Vercel Blob referansı)
// Birincil kullanım: TRAFİK sigortasında müşteriden istenen ruhsat/araç fotoğrafları.
model Asset {
  id         String       @id @default(auto()) @map("_id") @db.ObjectId
  path       String        // Vercel Blob pathname (silme için kullanılır)
  url        String        // Blob URL (tahmin-edilemez token içerir; doğrudan erişilir)
  kind       String        @default("ruhsat") // "ruhsat" | "arac" | "belge" ...
  mimeType   String?
  sizeBytes  Int?
  quote      QuoteRequest? @relation(fields: [quoteId], references: [id], onDelete: Cascade)
  quoteId    String?       @db.ObjectId // hangi teklife ait
  createdAt  DateTime      @default(now())

  @@index([quoteId])
}
```

## `payload` JSON Örnekleri

**Trafik:**

```json
{
  "tcKimlik": "12345678901",
  "plaka": "34 ABC 123",
  "dogumTarihi": "1990-05-12",
  "ruhsatTarihi": "2018-03-01"
}
```

**Konut:**

```json
{
  "ilIlce": "İstanbul / Kadıköy",
  "metrekare": 110,
  "yapiTarzi": "betonarme",
  "binaYasi": 12,
  "kat": 3,
  "mulkTipi": "ev_sahibi",
  "esyaBedeli": 250000
}
```

> Form alanlarının `definitions.ts`'teki tanımı ile `payload` anahtarları birebir
> eşleşir. Admin panel, talebi gösterirken aynı tanımı kullanıp alanları **etiketli**
> ve **okunabilir** biçimde render eder.

## Veri Saklama & Silme (KVKK)

- Her kaydın `createdAt`'i saklama süresi takibi için kullanılır.
- Saklama süresi dolan veya silme talebi gelen kayıtlar silinir/anonimleştirilir.
- Rıza kanıtı alanları (`consentAt`, `consentIp`) hukuki kanıt için tutulur.
- Detay → [06 KVKK](./06-kvkk-yasal-uyum.md).

## Dosya Depolama Notu (Vercel Blob) — K25

- Yüklenen ruhsat/araç fotoğrafları **kişisel veridir**. Vercel Blob'da, URL içinde
  **tahmin-edilemez rastgele token** bulunur; ancak bu URL **"public-stil"dir**
  (bağlantıya sahip olan erişebilir). Bu nedenle Blob URL'leri yalnızca **kimlik
  doğrulanmış admin ekranında** gösterilir, hiçbir yerde indekslenmez ve işlem sonrası
  silinebilir. Bu artık risk [06 KVKK](./06-kvkk-yasal-uyum.md)'da açıkça not edilmiştir.
- Yükleme genel siteden (web app), görüntüleme admin uygulamasından yapılır — ikisi de
  aynı Blob deposuna `BLOB_READ_WRITE_TOKEN` ile bağlanır
  (bkz. [01 ayrı domain mimarisi](./01-teknoloji-mimari.md)).
- `Asset.url` doğrudan Blob URL'idir (imzalı/geçici URL üretimi yok). `Asset.path`
  Blob pathname'idir ve KVKK imha sırasında Blob `del()` ile silmek için kullanılır.
- KVKK: bu dosyalar da saklama süresine ve silme talebine tabidir.

## 🔧 Bu Dökümanda Netleşecekler

- E-posta alanı zorunlu mu? (`email String?` → `String`?)
- Çok kullanıcılı admin gerekecek mi? (şimdilik tek ADMIN)
- Saklama süresi (ay/yıl) — yasal danışmanlıkla belirlenecek.
- Trafik dışındaki ürünlerde de dosya yükleme gerekecek mi? (`Asset.kind` genişler)
