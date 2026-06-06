# 09 — Tasarım & UI/UX

> ⭐ **Bu proje için tasarım kritik öneme sahip.** Site **modern, ilgi çekici ve
> güven veren** olmalı; UI/UX kalitesi yüksek tutulmalı. Aşağıdaki yön, kullanıcının
> sağladığı referans tasarıma dayanır.

## Tasarım Felsefesi

- **Modern & ilgi çekici** — güncel, "2026 hissi" veren; klişe/şablon görünmeyen.
- **Güven veren** — sigorta = güven işi. Renk, tipografi ve düzen ciddiyet + sıcaklık
  dengesi kurmalı.
- **Dönüşüm odaklı** — her ekranda net bir "Teklif Al" / WhatsApp yolu.
- **Sade ve nefes alan** — bol boşluk (whitespace), okunabilir hiyerarşi.
- **Mobil öncelikli** — ziyaretçilerin çoğu mobil; dokunma hedefleri büyük.

## Referans Tasarım

Kullanıcının sağladığı referans: `sigorta-acentesi-sitesi.html` (Downloads).
**Görsel dil ve UX akışı** buradan örnek alınır; içerik Doğukan'ın gerçek işine uyarlanır.

> Not: Referanstaki **çoklu şirket / "en uygun teklifi karşılaştır"** anlatısı Doğukan
> için **geçerlidir** — kendisi tek şirkete bağlı değil, **birçok firmanın acenteliğini**
> yapıyor. Yani bu mesajlaşma (anlaşmalı şirket şeridi, "20+ şirket fiyatını karşılaştır"
> tarzı) doğrudan kullanılabilir; içerik Doğukan'ın gerçek anlaşmalı şirketlerine göre
> doldurulur.

## Renk Paleti (Güven Veren)

Referanstaki palet — sıcak-editöryel, güven + enerji dengesi:

| Rol                       | Renk    | Hex       | Kullanım                                       |
| ------------------------- | ------- | --------- | ---------------------------------------------- |
| Ana mürekkep (lacivert)   | ![navy] | `#10243a` | Başlık, footer, koyu zeminler — ciddiyet/güven |
| Yumuşak mürekkep          |         | `#3a5168` | Gövde metni                                    |
| Krem (zemin)              |         | `#f7f2e9` | Sayfa arka planı — sıcak, yumuşak              |
| Krem derin                |         | `#efe6d6` | Bölüm ayrımı                                   |
| Kâğıt (kart)              |         | `#fffdf8` | Kart/form zeminleri                            |
| **Aksан / CTA (turuncu)** |         | `#f25a32` | Butonlar, çağrılar — dikkat/dönüşüm            |
| CTA koyu                  |         | `#d9421b` | Hover                                          |
| **Güven aksanı (teal)**   |         | `#1c6e6a` | İkincil vurgu, başarı, ikon zeminleri          |
| Teal yumuşak              |         | `#e3efed` | Rozet/ikon arka planı                          |

**Mantık:** Lacivert = güven/kurumsallık · Teal = sağlık/huzur · Turuncu = enerji/eylem
(sadece CTA'larda, az ve etkili). Bu kombinasyon hem güven verir hem sıkıcı durmaz.

> 🔧 Dark mode için bu paletin koyu varyantı türetilecek (lacivert zemin + açık metin,
> turuncu/teal aksanlar korunur). Renk değişkenleri CSS custom properties ile tek yerden.

## Tipografi

| Rol               | Font                      | Not                                     |
| ----------------- | ------------------------- | --------------------------------------- |
| Başlıklar (h1-h3) | **Fraunces** (serif)      | Karakterli, editöryel, güven + sıcaklık |
| Gövde / UI        | **Hanken Grotesk** (sans) | Modern, çok okunaklı                    |

- Büyük, iddialı başlıklar (`clamp()` ile akışkan ölçek).
- Başlıkta vurgu kelime italik + turuncu (örn. _"en uygun"_).
- 🔧 Türkçe karakter desteği (ş, ğ, ı, İ) fontlarda teyit edilecek; gerekirse alternatif.

### Logo / Marka (Wordmark)

- **Görsel logo yok.** Marka, metin tabanlı bir **wordmark**: **"Doğukan Özgan"**.
- Fraunces ile dizilir; istenirse "Özgan" turuncu vurgulu (referanstaki `Güven`**`Sigorta`**
  mantığı). Yanında küçük bir kalkan/onay ikonu (güven sembolü) opsiyonel olarak eklenebilir.
- Header, footer ve favicon bu wordmark/baş harf ("DÖ") üzerinden türetilir.

## UI Bileşen Dili

Referanstan alınan, tutarlı bir bileşen sistemi (shadcn/ui + Tailwind ile):

- **Butonlar:** tam yuvarlak (`pill`), birincil (dolu turuncu) + hayalet (çerçeveli).
  Hover'da hafif yukarı kalkma + gölge.
- **Kartlar:** yuvarlak köşe (~18px), ince çizgi, hover'da yükselme + gölge.
- **Rozetler (pill):** teal yumuşak zemin (örn. "⭐ 4.9/5", "Ücretsiz").
- **Form alanları:** yuvarlak, odakta teal halka (focus ring) — erişilebilir.
- **İkonlar:** ince çizgi (stroke) SVG ikonlar, tutarlı set.
- **Gölge & derinlik:** yumuşak, geniş gölgeler (sert değil).
- **Dokular:** ince grain/noise dokusu + radyal gradyan ışımalar (arka plan canlılığı).

## Mikro-etkileşim & Animasyon

- Görünüme girince yumuşak "rise" (yukarı kayarak belirme) animasyonu, kademeli gecikme.
- Hover geçişleri yumuşak (`transition`), abartısız.
- Smooth scroll (çapa linkleri).
- ⚠️ Performansı bozmayan, hafif animasyonlar — erişilebilirlik için
  `prefers-reduced-motion` desteklenir.

## Anasayfa Düzeni (Referans Akışı)

1. **Üst bar** — güven mesajı + telefon + "Hasar anında" linki.
2. **Header (sticky, blur)** — logo + menü + "Ücretsiz Teklif Al" butonu + dil/tema.
3. **Hero** — güçlü başlık + alt metin + çift CTA + **istatistik şeridi** (örn. "20+ şirket",
   "mutlu müşteri", "ortalama dönüş") + **yanında hızlı teklif formu kartı**.
4. **Güven şeridi** — anlaşmalı sigorta şirketleri (Allianz, Anadolu, AXA…).
5. **Branşlar** — ürün kartları (ikon + kısa açıklama + "Teklif al →").
6. **Nasıl çalışır** — 3 adım (büyük numaralarla).
7. **SSS** — sıkça sorulan sorular (açılır-kapanır).
8. **Final CTA** — koyu zeminli güçlü kapanış çağrısı.
9. **Footer** — branşlar, kurumsal linkler, iletişim + harita.
10. **Sabit FAB** — WhatsApp (+ mobilde ara) her sayfada.

> Not: Referans tasarımdaki "müşteri yorumları" bölümü **kullanılmayacak** (istenmedi).
> Güven, başka unsurlarla kurulacak: anlaşmalı şirket şeridi, deneyim/istatistik,
> şeffaf süreç anlatımı.

## UI/UX İlkeleri (Kontrol Listesi)

- [ ] Her ekranda net birincil eylem (CTA hiyerarşisi).
- [ ] Form: az alan, net etiket, anlık doğrulama, başarı ekranı.
- [ ] Yükleme/boş/hata durumları tasarlanmış (özellikle admin).
- [ ] Erişilebilirlik: kontrast (WCAG AA), klavye, focus görünür, `alt` metinleri.
- [ ] Dokunma hedefleri ≥ 44px, mobil menü kullanışlı.
- [ ] Tutarlılık: spacing/scale/renk tek tasarım token setinden.
- [ ] Hız algısı: iskelet (skeleton) yükleme, optimize görseller.

## Çözülen ✅

- **Logo:** Görsel logo yok → metin wordmark "Doğukan Özgan".
- **Konumlandırma:** Çoklu şirket acentesi → "en uygun teklif" anlatısı geçerli.

## 🔧 Bu Dökümanda Netleşecekler

- Dark mode renk varyantları (paletten türetilecek).
- Gerçek fotoğraf/görsel kaynağı (Doğukan'ın fotoğrafı, ofis vb.).
- Doğukan'ın gerçek anlaşmalı sigorta şirketleri listesi (güven şeridi için).

<!-- Renk önizleme rozetleri sadece referans içindir; markdown renk göstermez. -->

[navy]: #10243a
