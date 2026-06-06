# dogukanozgan.com — Yeni Site Dökümantasyonu

Doğukan Özgan (sigorta danışmanı / Akplan Sigorta) için **sıfırdan** geliştirilecek
yeni web sitesinin proje dökümantasyonudur. Mevcut statik site (jQuery + Bootstrap
şablonu) tamamen bırakılıp, modern bir **Next.js full-stack uygulaması** kurulacaktır.

> ⚠️ Bu klasördeki dökümanlar **canlı belgelerdir** — kararlar netleştikçe güncellenir.
> Üzerinde `🔧 Sonra netleşecek` etiketi olan bölümler, ileride birlikte düzeltilecek
> noktalardır.

## Okuma Sırası

Dökümanlar adım adım ilerleyecek şekilde numaralandırılmıştır:

| #   | Döküman                                                                     | İçerik                                                            |
| --- | --------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| 00  | [Proje Özeti](./00-proje-ozeti.md)                                          | Amaç, kapsam, alınan tüm kararlar                                 |
| 01  | [Teknoloji & Mimari](./01-teknoloji-mimari.md)                              | Yığın, klasör yapısı, veri akışı                                  |
| 02  | [Site Haritası & Sayfalar](./02-site-haritasi-sayfalar.md)                  | Tüm sayfalar ve içerik yapısı                                     |
| 03  | [Ürünler, Formlar & Hesaplayıcılar](./03-urunler-formlar-hesaplayicilar.md) | Ürün bazlı form alanları ve hesaplama mantığı                     |
| 04  | [Veri Modeli](./04-veri-modeli.md)                                          | Veritabanı şeması (Prisma)                                        |
| 05  | [Admin Panel & CRM](./05-admin-panel-crm.md)                                | Yönetim arayüzü ve teklif takip akışı                             |
| 06  | [KVKK & Yasal Uyum](./06-kvkk-yasal-uyum.md)                                | Kişisel veri koruma kontrol listesi                               |
| 07  | [Çok Dilli, Tema & SEO](./07-cokdilli-tema-seo.md)                          | TR/EN, dark mode, arama motoru                                    |
| 08  | [Yol Haritası](./08-yol-haritasi.md)                                        | Aşamalı geliştirme planı                                          |
| 09  | [Tasarım & UI/UX](./09-tasarim-ui-ux.md)                                    | ⭐ Modern/güven veren tasarım, renk paleti, bileşenler            |
| 10  | [Deploy & Yayın Runbook](./10-deploy-yayin.md)                              | Aşama 6 adım adım: Supabase, Vercel, domain, env, migration, seed |
| 11  | [Go-Live Checklist](./11-go-live-checklist.md)                              | Yayın öncesi kontrol listesi (DEV/USR/LAW)                        |
| 📝  | [project-history.md](./project-history.md)                                  | Geliştirme günlüğü (append-only) — her değişiklik buraya işlenir  |

> Doğukan'a teslim: [`../teslim/kullanim-kilavuzu.md`](../teslim/kullanim-kilavuzu.md)
> — admin panel kullanım kılavuzu (sade dil).

> **Geliştirme kuralları:** Tüm geliştirme [`../CLAUDE.md`](../CLAUDE.md)'deki iki
> kurala tabidir: (1) dökümantasyona sıkı bağlılık, (2) her değişikliği
> `project-history.md`'e işleme. Sub-agent tanımları `.claude/agents/` altındadır.

## Hızlı Özet

- **Ne:** Sigorta danışmanlığı tanıtım sitesi + online teklif toplama + admin/CRM paneli
- **Yığın:** Next.js (App Router) · TypeScript · Tailwind · Prisma · Supabase (PostgreSQL + Storage) · Vercel
- **Diller:** Türkçe + İngilizce (yayın Türkiye)
- **Çekirdek akış:** Ziyaretçi ürün sayfasındaki forma bilgi girer → veritabanına kaydolur → Doğukan admin panelden görür ve CRM ile takip eder
- **Yasal:** Tam KVKK uyumu (aydınlatma metni, açık rıza, çerez onayı, sağlık verisi özel koruması)
- **Tasarım:** ⭐ Modern, ilgi çekici ve güven veren; lacivert+teal+turuncu palet, Fraunces+Hanken Grotesk tipografi (bkz. [09](./09-tasarim-ui-ux.md))
- **SEO:** Her detayda gözetilir — sayfa yapısı, içerik, metadata, performans, yapısal veri (bkz. [07](./07-cokdilli-tema-seo.md))
