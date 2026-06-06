# 11 — Yayın Öncesi Kontrol Listesi (Go-Live Checklist)

> Siteyi canlıya almadan önce buradaki her madde işaretlenmeli. Adım adım kurulum için
> [10 Deploy Runbook](./10-deploy-yayin.md). Aşama: [08 Aşama 6](./08-yol-haritasi.md).
>
> Lejant: **[DEV]** geliştirici/teknik · **[USR]** Doğukan'dan beklenen ·
> **[LAW]** hukukçu onayı gerektiren.

## A. Kod & Derleme

- [ ] **[DEV]** `pnpm install` temiz çalışıyor.
- [ ] **[DEV]** `pnpm typecheck` hatasız (tüm workspace).
- [ ] **[DEV]** `pnpm build` hatasız (web + admin).
- [ ] **[DEV]** Lint/format git hook'ları geçiyor (`pre-commit`, `pre-push`).
- [ ] **[DEV]** Repo `main` dalı GitHub'a push'lanmış.

## B. Veritabanı & Storage (MongoDB Atlas + Vercel Blob) — K25

- [ ] **[USR]** MongoDB Atlas cluster oluşturuldu + DB user + network access.
- [ ] **[DEV]** Şema cluster'a uygulandı (`prisma db push`).
- [ ] **[USR/DEV]** Vercel Blob store oluşturuldu, `BLOB_READ_WRITE_TOKEN` alındı.
- [ ] **[DEV]** İlk admin kullanıcı seed'lendi (`seed:admin`), şifre Doğukan'a iletildi.

## C. Ortam Değişkenleri (Vercel)

> Tam liste: [Runbook §7](./10-deploy-yayin.md#7-ortam-değişkenleri--tek-tablo).

- [ ] **[DEV]** Web projesi env'leri girildi (`DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`,
      `NEXT_PUBLIC_SITE_URL`).
- [ ] **[DEV]** Admin projesi env'leri girildi (`DATABASE_URL`, `BLOB_READ_WRITE_TOKEN` + `AUTH_SECRET`, `ADMIN_EMAIL`).
- [ ] **[DEV]** `AUTH_SECRET` üretildi (`openssl rand -base64 32`).
- [ ] **[DEV]** `BLOB_READ_WRITE_TOKEN`, `DATABASE_URL` ve şifreler **repoda DEĞİL**
      (sadece Vercel).

## D. Deploy & Domain

- [ ] **[DEV]** İki ayrı Vercel projesi (web → `apps/web`, admin → `apps/admin`).
- [ ] **[USR]** Domain DNS kayıtları girildi (`dogukanozgan.com`, `www`, `admin.…`).
- [ ] **[DEV]** **SSL** sertifikaları aktif (Vercel otomatik, DNS sonrası).
- [ ] **[DEV]** `www` → apex yönlendirmesi ayarlı.

## E. SEO & Yönlendirme

- [ ] **[DEV]** `robots.txt` ve `sitemap.xml` erişilebilir (web).
- [ ] **[DEV]** Admin domaini `noindex` (Google'a kapalı).
- [ ] **[DEV]** Eski site URL'leri **301** dönüyor (örn. `/planlar/trafik.html` →
      `/tr/planlar/trafik`) — `apps/web/next.config.mjs` `redirects()`.
- [ ] **[DEV]** Canonical + hreflang (tr/en/x-default) head'de.

## F. KVKK & Yasal

- [ ] **[LAW]** Aydınlatma, Gizlilik, Çerez politikası metinleri **hukukçu onaylı**.
- [ ] **[LAW]** **Saklama süresi** belirlendi (ve gerekiyorsa imha mekanizması).
- [ ] **[DEV]** Çerez banner'ı çalışıyor; **analitik yalnızca "Tümünü kabul et"**
      sonrası yükleniyor (onay yoksa hiçbir 3. taraf isteği yok).
- [ ] **[DEV]** Form rıza kutuları zorunlu; sağlık formunda 2. rıza; rıza kanıtı
      (IP/zaman/UA) kaydediliyor.
- [ ] **[USR]** Gerekiyorsa **VERBİS** kaydı (işletme şartına bağlı).

## G. İçerik & Gerçek Veriler

- [ ] **[USR]** Gerçek **anlaşmalı şirket listesi** (+ logolar) — şu an yer tutucu
      (`apps/web/src/lib/site.ts` `partnerCompanies`).
- [ ] **[USR]** **Form alanları** her ürün için nihai (`packages/products/definitions.ts`).
- [ ] **[USR]** **Hesaplayıcı formülleri** (Sağlık/BES/Hayat) gerçek oranlarla
      (`packages/products/src/calculators/`) — şu an yer tutucu.
- [ ] **[USR]** Doğukan'ın **fotoğrafı / ofis görseli** (opsiyonel, görsel için).
- [ ] **[USR]** Gerçek **sosyal medya** hesapları, **harita koordinatı**.
- [ ] **[USR]** **Analitik kararı** (Plausible / GA4 / yok) + varsa ID.
- [ ] **[DEV/USR]** EN içeriklerin nihai redaksiyonu.

## H. Yayın Sonrası Duman Testi (Smoke Test)

- [ ] `dogukanozgan.com` açılıyor, `/` → `/tr`, SSL yeşil.
- [ ] Test teklifi gönderildi → MongoDB `QuoteRequest`'e düştü.
- [ ] Trafik fotoğrafı yüklendi → Vercel Blob'a düştü, adminde Blob URL ile görünüyor.
- [ ] `admin.dogukanozgan.com` → giriş çalışıyor, korumalı sayfalar auth istiyor.
- [ ] WhatsApp/ara butonları doğru numarayı açıyor.

---

## Özet — Kullanıcıdan (Doğukan) Beklenenlerin Kısa Listesi

1. **MongoDB Atlas** hesabı + cluster (DB) ve **Vercel Blob** store (foto deposu).
2. **Vercel** hesabı (iki proje deploy için).
3. **Domain DNS** erişimi (`dogukanozgan.com` + `admin` alt alan adı).
4. **Hukukçu onaylı** KVKK/aydınlatma/gizlilik/çerez metinleri + **saklama süresi**.
5. **Gerçek içerik:** anlaşmalı şirket listesi (+logolar), form alanları, hesaplayıcı
   formülleri, fotoğraf/ofis görseli, sosyal medya, harita.
6. **Analitik** kararı (+ ID, kullanılacaksa).
7. (Gerekirse) **VERBİS** kaydı.
