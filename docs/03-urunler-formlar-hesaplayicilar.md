# 03 — Ürünler, Formlar & Hesaplayıcılar

> Bu döküman projenin kalbidir: her ürünün **kendi sayfası**, **kendine özel form
> alanları** ve **gerekiyorsa hesaplayıcısı** vardır.
>
> ⚠️ Tüm form alanları ve hesaplayıcılar **taslaktır** — "sonradan düzelteceğim"
> dendiği için esnek tasarlanmıştır. Hepsi tek dosyadan (`definitions.ts`) yönetilecek
> (bkz. [01 — A Yaklaşımı](./01-teknoloji-mimari.md)).

## Sayfa Ayrımı: Tanım/Reklam ↔ Teklif (Form)

Her ürün **iki sayfaya** ayrılır (bkz. [02](./02-site-haritasi-sayfalar.md)):

1. **Tanım/Reklam sayfası** — `/planlar/[slug]` (EN: `/plans/[slug]`).
   Sigortanın ne olduğu/ne işe yaradığı, kapsam-teminat öne çıkanları, avantajlar,
   "neden Doğukan ile", kısa ürün SSS'i ve **(varsa) hesaplayıcı** burada bulunur.
   **Teklif formu BURADA YOKTUR.** Belirgin bir "Teklif Al" CTA ziyaretçiyi teklif
   sayfasına götürür. Hesaplayıcıdaki "bu değerlerle teklif al" da teklif sayfasına gider
   (hesaplayıcı değerleri query string ile ön-doldurulabilir — opsiyonel kolaylık).
2. **Teklif (form) sayfası** — `/planlar/[slug]/teklif` (EN: `/plans/[slug]/quote`).
   Yalnızca ürüne özel **AutoForm** (KVKK modal'lı rıza ile). Üstte tanım sayfasına geri
   link + ürün başlığı. **Hesaplayıcı BURADA YOKTUR** (odak: tek adımlı dönüşüm).

> Gerekçe: Tanıtım içeriği SEO + ikna için zengin tutulur; form ekranı dikkat dağıtmadan
> tek odaklı tutulur (dönüşüm). İçerik/alanlar tek kaynaktan (`definitions.ts`) üretilir.

## Ortak Kurallar (Tüm Formlarda)

Her teklif formunda, ürüne özel alanlardan **bağımsız** olarak şunlar bulunur:

- **Ad Soyad** (zorunlu)
- **Telefon** (zorunlu)
- **E-posta** (opsiyonel — 🔧 netleşecek)
- **KVKK açık rıza onay kutusu** (zorunlu — işaretlenmeden gönderilemez). Rıza kutusu,
  kullanıcı aydınlatma metnini **modal'da açıp en alta kadar okumadan** işaretlenemez
  (rıza-UX kuralı → bkz. [06 KVKK](./06-kvkk-yasal-uyum.md)).
- _(Sağlık/hayat verisi içeren formlarda)_ **özel nitelikli veri için ayrı açık rıza**,
  aynı modal+scroll-okuma deseniyle (bkz. [06 KVKK](./06-kvkk-yasal-uyum.md))

## Alan Tipleri (Form Builder Sözlüğü)

`definitions.ts` içinde kullanılacak alan tipleri:

| Tip        | Açıklama                                                                |
| ---------- | ----------------------------------------------------------------------- |
| `text`     | Serbest metin                                                           |
| `tel`      | Telefon                                                                 |
| `email`    | E-posta                                                                 |
| `number`   | Sayı (m², tutar, yaş vb.)                                               |
| `date`     | Tarih (doğum tarihi vb.)                                                |
| `select`   | Açılır liste (seçenekli)                                                |
| `radio`    | Tekli seçim (cinsiyet vb.)                                              |
| `checkbox` | Evet/hayır (sigara, SGK vb.)                                            |
| `tcKimlik` | TC Kimlik No (özel doğrulamalı)                                         |
| `plaka`    | Plaka (özel doğrulamalı)                                                |
| `file`     | Dosya/fotoğraf yükleme (Supabase Storage'a gider; örn. trafikte ruhsat) |

---

## Ürün Listesi

> Doğukan **tüm** sigorta ürünlerini yapabiliyor; site de **tüm ürünleri** kapsayacak.
> "A yaklaşımı" ile her ürün `definitions.ts`'e tanımlanır. Aşağıda bilinen ürünler ve
> form taslakları var; yeni ürün eklemek tek nesne eklemekten ibarettir.
>
> **Hedef ürün seti (referans tasarım + Doğukan):** Trafik · Kasko · Sağlık (Özel/TSS) ·
> Hayat · Bireysel Emeklilik (BES) · Konut · DASK · Ferdi Kaza · İş Yeri · _(+ eklenecekler)_
>
> **Hesaplayıcı durumu (mevcut bilgiye göre):** Sağlık ✅ · BES ✅ · Hayat ✅ ·
> Trafik ❌ · diğerleri 🔧 netleşecek.

> **Yerelleştirilmiş slug'lar (i18n):** Her ürünün slug'ı `slugs: { tr, en }`
> olarak tanımlanır. TR slug **kanonik**tir (eski URL'ler ve 301 hedefleri TR'dir).
> EN sayfalar EN slug ile yayınlanır (örn. `/en/plans/traffic`). Yardımcılar:
> `getLocalizedSlug(product, locale)` ve `getProductByLocalizedSlug(locale, slug)`.
>
> | Ürün               | slug.tr (kanonik)    | slug.en           |
> | ------------------ | -------------------- | ----------------- |
> | Trafik             | `trafik`             | `traffic`         |
> | Sağlık             | `saglik`             | `health`          |
> | Bireysel Emeklilik | `bireysel-emeklilik` | `private-pension` |
> | Hayat              | `hayat`              | `life`            |
> | Konut              | `konut`              | `home-insurance`  |
>
> Not: Konut için EN slug `home-insurance` seçildi (`home` tek başına anasayfa/genel
> "home" ile karışabilir; ürün niyetini netleştirmek için). 🔧 Doğukan farklı isterse
> tek noktadan (`definitions.ts` `slugs.en`) değişir.

### 1) 🚗 Trafik Sigortası (Zorunlu)

- **Slug:** `trafik`
- **Hesaplayıcı:** ❌ Yok (fiyat resmî tarifeye/plakaya bağlı, gerçekçi hesaplanamaz)
- **📷 Fotoğraf yükleme:** ✅ **VAR** — müşteriden ruhsat/araç fotoğrafı istenir.
  Yüklenen dosyalar Supabase Storage'a gider, talebe bağlanır (bkz. [04](./04-veri-modeli.md)).
- **Form alanları:**
  | Alan | Tip | Zorunlu |
  |------|-----|---------|
  | Ad Soyad | text | ✅ |
  | Telefon | tel | ✅ |
  | TC Kimlik No | tcKimlik | ✅ |
  | Plaka | plaka | ✅ |
  | Doğum Tarihi | date | ✅ |
  | Ruhsat/Tescil Tarihi | date | ⬜ |
  | **Ruhsat / araç fotoğrafı** | `file` (görsel) | ⬜ (🔧 zorunlu mu netleşecek) |

### 2) 🏥 Sağlık Sigortası (Özel / Tamamlayıcı)

- **Slug:** `saglik`
- **Hesaplayıcı:** ✅ **VAR** (mevcut bilgiye göre; formül 🔧 netleşecek)
- **⚠️ Özel durum:** "Kronik hastalık" alanı **sağlık verisi** = özel nitelikli
  kişisel veri → ek açık rıza ve ekstra koruma gerekir.
- **Form alanları:**
  | Alan | Tip | Zorunlu |
  |------|-----|---------|
  | Ad Soyad | text | ✅ |
  | Telefon | tel | ✅ |
  | Doğum Tarihi (yaş) | date | ✅ |
  | Cinsiyet | radio | ✅ |
  | SGK'lı mı? (TSS/Özel ayrımı) | checkbox | ✅ |
  | Sigara kullanımı | checkbox | ⬜ |
  | Mevcut kronik hastalık (var/yok) | radio | ⬜ |
  | İl | select | ✅ |
  | Kapsam (bireysel/aile) | radio | ✅ |
  | Aile ise kişi sayısı | number | ⬜ |

### 3) 💰 Bireysel Emeklilik (BES)

- **Slug:** `bireysel-emeklilik`
- **Hesaplayıcı:** ✅ **VAR — BES Birikim Hesaplayıcı** (aşağıda)
- **Form alanları:**
  | Alan | Tip | Zorunlu |
  |------|-----|---------|
  | Ad Soyad | text | ✅ |
  | Telefon | tel | ✅ |
  | Yaş | number | ✅ |
  | Aylık ödemek istenen tutar | number | ✅ |
  | Hedef (emeklilik/birikim) | radio | ⬜ |

### 4) ❤️ Hayat Sigortası

- **Slug:** `hayat`
- **Hesaplayıcı:** ✅ **VAR** (mevcut bilgiye göre; formül 🔧 netleşecek)
- **Not:** "Sağlık durumu" sorulursa o da özel nitelikli veri sayılır → ek rıza.
- **Form alanları (taslak):**
  | Alan | Tip | Zorunlu |
  |------|-----|---------|
  | Ad Soyad | text | ✅ |
  | Telefon | tel | ✅ |
  | Doğum Tarihi (yaş) | date | ✅ |
  | Cinsiyet | radio | ⬜ |
  | Teminat tutarı (istenen) | number | ⬜ |
  | Süre (yıl) | number | ⬜ |
  | Amaç (kredi/birikim/koruma) | radio | ⬜ |
  | Sigara kullanımı | checkbox | ⬜ |

### 5) 🏠 Konut Sigortası

- **Slug:** `konut`
- **Hesaplayıcı:** 🔧 Netleşecek (kullanıcının saydığı mevcut hesaplayıcılar arasında
  yok; DASK için teknik olarak mümkün — istenirse eklenir)
- **Form alanları:**
  | Alan | Tip | Zorunlu |
  |------|-----|---------|
  | Ad Soyad | text | ✅ |
  | Telefon | tel | ✅ |
  | İl / İlçe | select | ✅ |
  | Brüt m² | number | ✅ |
  | Yapı tarzı (betonarme/yığma/çelik) | select | ✅ |
  | Bina yaşı / inşaat yılı | number | ✅ |
  | Kat | number | ⬜ |
  | Mülk tipi (ev sahibi/kiracı) | radio | ✅ |
  | Eşya bedeli | number | ⬜ |

### 🔮 Olası Ek Ürünler (sonra eklenecek adaylar)

Kasko · DASK (ayrı) · Seyahat Sağlık · İşyeri · Ferdi Kaza · Nakliyat · Tarım …
Her biri eklenirken kendi form alanları `definitions.ts`'e tanımlanacak.

---

## Hesaplayıcılar

### BES Birikim Hesaplayıcı

**Amaç:** "Aylık X TL, Y yıl boyunca ödersem yaklaşık ne birikir?" — devlet katkısı dahil.

**Girdiler:**

- Aylık katkı payı (TL)
- Süre (yıl)
- Tahmini yıllık getiri oranı (%) — varsayılan + kullanıcı ayarlayabilir

**Hesaplama mantığı (taslak):**

- Aylık katkılar üzerine **%30 devlet katkısı** eklenir.
- Bileşik getiri (aylık) uygulanır.
- Çıktı: tahmini toplam birikim + toplam yatırılan + devlet katkısı tutarı.

```
toplamKatki   = aylikKatki * 12 * yil
devletKatkisi = toplamKatki * 0.30
tahminiBirikim = bileşikGetiri(aylikKatki * 1.30, aylikOran, ay)
```

> ⚠️ Sonuç ekranında **"Tahmini değerdir, kesin teklif için form doldurun"** uyarısı
> zorunlu. Hesaplayıcının altında ilgili ürünün teklif formu gösterilir.
> 🔧 Devlet katkısı oranı/limitleri ve getiri varsayımı güncel mevzuata göre teyit edilecek.

### Sağlık Sigortası Hesaplayıcı

**Amaç:** Yaşa / kapsama göre yaklaşık prim tahmini.

**Girdiler (taslak):** Yaş · cinsiyet · SGK durumu (TSS/Özel) · kapsam (bireysel/aile)
**Çıktı:** Tahmini aylık/yıllık prim aralığı.

> 🔧 Hesaplama formülü/katsayıları netleşecek. ⚠️ "Tahmini değerdir" uyarısı + altında
> teklif formu. Sağlık verisi sorulursa ek rıza.

### Hayat Sigortası Hesaplayıcı

**Amaç:** Teminat tutarı / süre / yaşa göre yaklaşık prim tahmini.

**Girdiler (taslak):** Yaş · teminat tutarı · süre (yıl) · sigara durumu
**Çıktı:** Tahmini prim.

> 🔧 Formül netleşecek. ⚠️ "Tahmini değerdir" uyarısı + altında teklif formu.

### Konut / DASK Tahmini Hesaplayıcı (🔧 opsiyonel — istenirse)

Kullanıcının saydığı mevcut hesaplayıcılar arasında değil; ancak DASK resmî tarifesi
teknik olarak hesaplanabilir. İstenirse eklenir.

**Girdiler:** İl (deprem risk bölgesi) · brüt m² · yapı tarzı · _(inşaat yılı)_
**Mantık (taslak):** `m² × birim_fiyat(yapı tarzı) × bölge_katsayısı`, azami teminat limiti.

> 🔧 Güncel DASK tarife tablosu teyit edilecek.

---

## Form → Veritabanı Eşlemesi

Tüm formlar ortak bir `QuoteRequest` tablosuna yazılır. Ürüne özel alanlar tek tek
sütun yerine **JSON** alanında tutulur (esneklik için — yeni alan eklemek migration
gerektirmez). Detay → [04 Veri Modeli](./04-veri-modeli.md).

## 🔧 Bu Dökümanda Netleşecekler

- Her ürünün nihai alanları (ekle/çıkar) + diğer ürünlerin (Kasko, Ferdi Kaza, İş Yeri,
  DASK ayrı) form alanları.
- Hesaplama formülleri/katsayıları: BES devlet katkısı, sağlık & hayat prim mantığı,
  (istenirse) DASK tarifesi — güncel mevzuata göre.
- Trafikte fotoğraf yükleme **zorunlu mu** opsiyonel mi?
- Konut'ta hesaplayıcı olacak mı?
- E-posta alanı formlarda zorunlu mu opsiyonel mi?
