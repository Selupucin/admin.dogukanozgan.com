# 08 — Yol Haritası (Aşamalı Geliştirme)

Proje "adım adım" ilerleyecek. Her aşama kendi içinde çalışır/test edilebilir bir
sonuç üretir. Aşamalar onaylandıkça koda geçilecek.

## Aşama 0 — Hazırlık & Kurulum

- [ ] **Monorepo** kurulumu (apps/web + apps/admin + packages) — bkz. [01](./01-teknoloji-mimari.md)
- [ ] Next.js + TypeScript + Tailwind + shadcn/ui (her iki app)
- [ ] **İki ayrı Vercel projesi** + iki domain (web: **dogukanozgan.com**, admin: **admin.dogukanozgan.com**)
- [ ] Supabase projesi (PostgreSQL + Storage, private bucket) + `.env`
- [ ] `packages/db`: Prisma kurulumu + ilk şema (`QuoteRequest`, `User`, `Asset`, `Note`)
- [ ] next-intl + next-themes temel iskelet (TR/EN, dark mode)
- [ ] **Tasarım token'ları** (`packages/ui`): renk paleti, tipografi, bileşen temeli — bkz. [09](./09-tasarim-ui-ux.md)
- [ ] **Kod kalitesi araçları** (`packages/config`): ESLint + Prettier + tsconfig paylaşımlı tabanlar — bkz. [01 K24](./01-teknoloji-mimari.md#geliştirme-araçları--kod-kalitesi)
- [ ] **Git hook'ları** (Husky + lint-staged): `pre-commit` (lint-staged) + `pre-push` (`pnpm typecheck`). Repo `.husky/` versiyonlanır.
- [ ] **Git repo + `.gitignore`** (Next.js + Node + Prisma + Supabase + `.env*`) — kurulum öncesi ✅ (2026-06-04)

**Çıktı:** İki domainde de çalışan, deploy edilmiş iskelet.

## Aşama 1 — Ürün Altyapısı (A Yaklaşımı)

- [ ] `definitions.ts` — ürün + form alanı tanım sistemi
- [ ] Tanımdan **otomatik form üreten** bileşen (React Hook Form + Zod)
- [ ] Ürün detay şablonu `/[locale]/planlar/[slug]`
- [ ] İlk ürünlerin tanımlanması (Trafik, Sağlık, BES, Konut)

**Çıktı:** Ürün sayfaları ve formları (henüz veritabanına yazmadan) görünür.

## Aşama 2 — Teklif Akışı + Dosya Yükleme + KVKK

- [ ] Server Action ile form → `QuoteRequest` kaydı
- [ ] **Trafikte fotoğraf yükleme** → Supabase Storage (private) + `Asset` kaydı
- [ ] KVKK rıza kutusu + kanıt kaydı (IP, zaman) + sağlık/hayat için 2. rıza
- [ ] Çerez banner'ı + yasal sayfalar (aydınlatma, gizlilik, çerez)
- [ ] Başarı/hata ekranları, spam koruması (rate limit)

**Çıktı:** Ziyaretçi teklif (ve gerekiyorsa fotoğraf) gönderebiliyor, veri güvenli ve yasal kaydediliyor.

## Aşama 3 — Admin Panel & CRM (ayrı domain)

- [ ] `apps/admin`: Auth.js girişi + tüm uygulama koruması (middleware) + `noindex`
- [ ] Teklif listesi (filtre, arama, özet kartları)
- [ ] Teklif detayı (etiketli alanlar, yüklenen fotoğraflar imzalı URL ile, WhatsApp/ara)
- [ ] CRM durum yönetimi + notlar
- [ ] Silme/anonimleştirme (KVKK)

**Çıktı:** Doğukan talepleri ayrı admin domaininden yönetebiliyor.

## Aşama 4 — Hesaplayıcılar

- [ ] BES birikim hesaplayıcı (devlet katkısı dahil)
- [ ] Sağlık prim tahmin hesaplayıcı
- [ ] Hayat prim tahmin hesaplayıcı
- [ ] (İstenirse) Konut/DASK tahmin hesaplayıcı
- [ ] "Tahmini değerdir" uyarısı + altında ilgili teklif formu

**Çıktı:** Etkileşimli hesaplayıcılar dönüşümü artırıyor.

## Aşama 5 — İçerik & Cila

- [ ] Anasayfa, Hakkımda, İletişim, **SSS** içerikleri (TR + EN)
- [ ] ⭐ Tasarımın tam uygulanması (referans kalitesinde, modern/güven veren) — [09](./09-tasarim-ui-ux.md)
- [ ] 🔍 SEO (metadata, sitemap, JSON-LD/FAQ, hreflang) — her sayfada
- [ ] Sabit WhatsApp butonu, harita, sosyal medya
- [ ] Görsel/performans optimizasyonu, erişilebilirlik (Core Web Vitals)

> Not: Blog ve müşteri yorumları **yok** (istenmedi).

**Çıktı:** Yayına hazır, cilalı site.

## Aşama 6 — Yayın & Devir

- [ ] Domain bağlama (dogukanozgan.com → Vercel)
- [ ] Eski siteden taşıma / yönlendirmeler (301)
- [ ] Admin hesabı oluşturma + Doğukan'a kısa kullanım kılavuzu
- [ ] İzleme (analitik — çerez onaylı)

**Çıktı:** Canlı yeni site.

---

## Önce Netleşmesi Gereken Açık Sorular (koda başlamadan)

Çözülenler [00 Proje Özeti](./00-proje-ozeti.md)'nde işaretli (logo, konumlandırma,
admin domain, ürünler, hesaplayıcı kapsamı vb.).

**Kodlamadan SONRA Doğukan'ın vereceği (yer tutucu ile başlanır):**

- ⏳ Hesaplama formülleri (BES/sağlık/hayat) — hesaplayıcı iskeleti yer tutucu formülle kurulur.
- ⏳ Her ürünün nihai form alanları — taslak alanlarla başlanır, sonra güncellenir.

**Hâlâ açık:**

- ❓ KVKK saklama süresi + yasal metinlerin nihai içeriği (hukukçu onayı).

> Sıradaki adım: Yer tutucularla **Aşama 0**'dan koda başlanabilir; gerçek formüller ve
> form alanları kodlama sürerken Doğukan'dan alınıp yerine konur.
