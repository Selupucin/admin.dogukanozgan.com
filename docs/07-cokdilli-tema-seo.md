# 07 — Çok Dilli, Tema & SEO

## Çok Dilli (TR / EN) — next-intl

- **Varsayılan dil:** Türkçe (`tr`). Yayın Türkiye.
- **İkincil dil:** İngilizce (`en`).
- **Rota yapısı:** `/[locale]/...` → `/tr/planlar/trafik`, `/en/plans/traffic`.
  EN'de yol parçaları VE ürün slug'ları da çevrilir (next-intl `pathnames` +
  ürün `slugs.en`). Yol/slug eşleme tabloları → [02](./02-site-haritasi-sayfalar.md),
  [03](./03-urunler-formlar-hesaplayicilar.md). `hreflang`/canonical her locale'in
  YEREL yoluna işaret eder; TR kanoniktir.
- **Çeviri dosyaları:** `src/messages/tr.json`, `src/messages/en.json`.
- **Dil değiştirici:** Header'da, mevcut sayfanın diğer dildeki karşılığına geçer.
- **Ürün içerikleri:** `definitions.ts`'te isim/açıklama/etiketler `{ tr, en }` çift olarak.

```ts
name: { tr: "Trafik Sigortası", en: "Traffic Insurance" }
```

> 🔧 EN içeriklerin metinleri (ürün açıklamaları, hakkımda, yasal sayfalar) ayrıca
> yazılacak/çevrilecek. Yasal metinlerin (KVKK) EN çevirisi bilgilendirme amaçlıdır;
> hukuki geçerli metin TR'dir.

## Tema (Dark / Light) — next-themes

- Header'da güneş/ay düğmesi ile geçiş.
- Sistem tercihini (OS dark mode) otomatik algılar.
- Seçim `localStorage`'da saklanır (çereze gerek yok → KVKK açısından sade).
- Tailwind `dark:` varyantları ile tasarlanır; renk paleti tek yerden (CSS değişkenleri).

## SEO — Her Detayda 🔍

> ⭐ **Kullanıcı isteği:** SEO **her detayda** gözetilecek. Bu bir "sonradan eklenecek
> özellik" değil; her sayfa, bileşen ve içerik kararında SEO bir kriterdir.

Sigorta acentesi için organik trafik değerli. Next.js bunu güçlü destekler:

- **Sunucu render (SSR/SSG)** — sayfalar arama motoruna tam içerikle gelir.
- **Metadata API** — her sayfa için başlık, açıklama, Open Graph görseli.
- **Çok dilli SEO:** `hreflang` etiketleri (tr/en) otomatik.
- **`sitemap.xml`** ve **`robots.txt`** otomatik üretilir.
- **Yapısal veri (JSON-LD):** `InsuranceAgency` / `LocalBusiness` şeması — ad, telefon,
  adres, çalışma saatleri → Google'da zengin sonuç.
- **Performans:** Görsel optimizasyonu (`next/image`), hızlı LCP → SEO + dönüşüm.
- **Anlamlı URL'ler:** `/planlar/bireysel-emeklilik` gibi.
- **Admin/kişisel veri sayfaları:** `noindex`.

### Yerel SEO (önemli)

- Google Business Profile ile uyumlu adres/telefon (NAP tutarlılığı).
- İletişim sayfasında harita + tam adres.
- 🔧 Hedef anahtar kelimeler (örn. "Şişli sağlık sigortası", "trafik sigortası teklifi")
  içerik yazımında kullanılacak.

### Her Ürün Sayfası İçin SEO (önemli kazanım)

Her sigorta ürünü ayrı sayfa olduğundan, her biri kendi anahtar kelimesini hedefler:

- Benzersiz başlık + meta açıklama (ürün + lokasyon).
- Ürüne özel **SSS → FAQ yapısal verisi (JSON-LD)** → Google'da "akordeon" zengin sonuç.
- Açıklayıcı, özgün içerik (ince/şablon içerik değil).
- Anlamlı URL (`/planlar/trafik`, `/planlar/saglik`…).

### Admin Domaini ve SEO

- Admin (`admin.dogukanozgan.com`) **tamamen `noindex` + `robots disallow`** →
  arama motorlarına hiç görünmez, genel site SEO'sunu kirletmez (bkz. [01](./01-teknoloji-mimari.md), [05](./05-admin-panel-crm.md)).

### SEO Kontrol Listesi (her sayfada)

- [ ] Tekil `<title>` + `meta description`
- [ ] Tek bir `<h1>`, mantıklı başlık hiyerarşisi
- [ ] Open Graph + Twitter Card görselleri
- [ ] `hreflang` (tr/en) + canonical
- [ ] Görsellerde `alt`, `next/image` ile optimizasyon
- [ ] Hızlı LCP/CLS (Core Web Vitals yeşil)
- [ ] İlgili JSON-LD (LocalBusiness / FAQ / Service)
- [ ] İç bağlantılar (anasayfa ↔ ürün ↔ SSS)

## Performans & Erişilebilirlik Hedefleri

- Mobil öncelikli (kullanıcıların çoğu mobil).
- Lighthouse: Performans/SEO/Erişilebilirlik 90+.
- WCAG temel erişilebilirlik (kontrast, klavye, etiketler).

## 🔧 Bu Dökümanda Netleşecekler

- Analitik aracı (Google Analytics / Plausible) — çerez onayına bağlı.
- EN içeriklerin kim tarafından yazılacağı/çevrileceği.
- Hedef anahtar kelime listesi.
